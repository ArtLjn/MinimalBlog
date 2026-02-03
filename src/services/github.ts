import { Octokit } from 'octokit';
import type { BlogPost, PostFrontMatter, GitHubUser, GitHubConfig } from '@/types';

/**
 * GitHub API 服务层
 * 封装所有与 GitHub 的交互操作
 */
export class GitHubService {
  public octokit: Octokit | null = null;
  public config: GitHubConfig;

  constructor(config: GitHubConfig) {
    this.config = config;
    this.octokit = new Octokit({ auth: config.token });
  }

  /**
   * 验证 Personal Access Token 是否有效且具有 repo 权限
   */
  async authenticate(): Promise<{ success: boolean; user?: GitHubUser; error?: string }> {
    try {
      if (!this.octokit) {
        return { success: false, error: 'Octokit not initialized' };
      }

      // 1. 首先验证 Token 是否有效
      const { data: userData } = await this.octokit.rest.users.getAuthenticated();
      
      // 2. 然后尝试访问仓库，验证是否具有 repo 权限
      // 尝试获取仓库的内容，这需要 repo 权限
      await this.octokit.rest.repos.getContent({
        owner: this.config.owner,
        repo: this.config.repo,
        path: this.config.path || '',
      });
      
      return {
        success: true,
        user: {
          login: userData.login,
          avatar_url: userData.avatar_url,
          name: userData.name || userData.login,
          email: userData.email || '',
        },
      };
    } catch (error: any) {
      if (error.status === 404) {
        // 路径不存在，这是正常的，说明仓库存在但路径可能还没有创建
        // 我们可以继续，因为创建文件时会自动创建路径
        try {
          // 再次验证用户信息，确保 Token 有效
          const { data: userData } = await this.octokit.rest.users.getAuthenticated();
          return {
            success: true,
            user: {
              login: userData.login,
              avatar_url: userData.avatar_url,
              name: userData.name || userData.login,
              email: userData.email || '',
            },
          };
        } catch {
          return {
            success: false,
            error: 'Authentication failed',
          };
        }
      } else if (error.status === 401) {
        return {
          success: false,
          error: 'Invalid or expired token',
        };
      } else if (error.status === 403) {
        return {
          success: false,
          error: 'Token does not have repo permission',
        };
      } else if (error.name === 'AbortError' || error.message.includes('aborted')) {
        // 请求被中止，可能是用户导航到了其他页面或关闭了标签页
        return {
          success: false,
          error: 'Authentication request was aborted',
        };
      } else {
        return {
          success: false,
          error: error.message || 'Authentication failed',
        };
      }
    }
  }

  /**
   * 获取所有博客文章
   */
  async getPosts(): Promise<BlogPost[]> {
    try {
      if (!this.octokit) throw new Error('Not authenticated');

      const { data } = await this.octokit.rest.repos.getContent({
        owner: this.config.owner,
        repo: this.config.repo,
        path: this.config.path,
      });

      if (!Array.isArray(data)) {
        throw new Error('Invalid response from GitHub');
      }

      // 过滤出 .md 文件
      const mdFiles = data.filter(
        (item) => item.type === 'file' && item.name.endsWith('.md')
      );

      // 获取每个文件的内容
      const posts: BlogPost[] = [];
      for (const file of mdFiles) {
        try {
          const post = await this.getPostBySha(file.sha);
          if (post) posts.push(post);
        } catch (e) {
          console.error(`Failed to load post: ${file.name}`, e);
        }
      }

      // 按日期排序
      return posts.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    } catch (error: any) {
      console.error('Failed to get posts:', error);
      return [];
    }
  }

  /**
   * 通过 SHA 获取单个文章
   */
  private async getPostBySha(sha: string): Promise<BlogPost | null> {
    try {
      if (!this.octokit) throw new Error('Not authenticated');

      const { data } = await this.octokit.rest.git.getBlob({
        owner: this.config.owner,
        repo: this.config.repo,
        file_sha: sha,
      });

      const content = decodeURIComponent(escape(atob(data.content)));
      return this.parseMarkdown(content);
    } catch (error) {
      console.error('Failed to get post by sha:', error);
      return null;
    }
  }

  /**
   * 获取单个文章（通过 slug）
   */
  async getPost(slug: string): Promise<BlogPost | null> {
    try {
      if (!this.octokit) throw new Error('Not authenticated');

      const filePath = `${this.config.path}${slug}.md`;
      
      const { data } = await this.octokit.rest.repos.getContent({
        owner: this.config.owner,
        repo: this.config.repo,
        path: filePath,
      });

      if (Array.isArray(data) || !('content' in data)) {
        throw new Error('Invalid response');
      }

      const content = decodeURIComponent(escape(atob(data.content.replace(/\n/g, ''))));
      return this.parseMarkdown(content, slug);
    } catch (error: any) {
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * 创建新文章
   */
  async createPost(post: BlogPost): Promise<void> {
    try {
      if (!this.octokit) throw new Error('Not authenticated');

      const filePath = `${this.config.path}${post.slug}.md`;
      const content = this.serializeMarkdown(post);
      const encodedContent = btoa(unescape(encodeURIComponent(content)));

      await this.octokit.rest.repos.createOrUpdateFileContents({
        owner: this.config.owner,
        repo: this.config.repo,
        path: filePath,
        message: `Create post: ${post.title}`,
        content: encodedContent,
      });
    } catch (error: any) {
      console.error('Failed to create post:', error);
      throw new Error(error.message || 'Failed to create post');
    }
  }

  /**
   * 更新文章
   */
  async updatePost(post: BlogPost): Promise<void> {
    try {
      if (!this.octokit) throw new Error('Not authenticated');

      const filePath = `${this.config.path}${post.slug}.md`;
      
      // 先获取文件的 sha
      const { data: fileData } = await this.octokit.rest.repos.getContent({
        owner: this.config.owner,
        repo: this.config.repo,
        path: filePath,
      });

      if (Array.isArray(fileData) || !('sha' in fileData)) {
        throw new Error('Invalid response');
      }

      const content = this.serializeMarkdown(post);
      const encodedContent = btoa(unescape(encodeURIComponent(content)));

      await this.octokit.rest.repos.createOrUpdateFileContents({
        owner: this.config.owner,
        repo: this.config.repo,
        path: filePath,
        message: `Update post: ${post.title}`,
        content: encodedContent,
        sha: fileData.sha,
      });
    } catch (error: any) {
      console.error('Failed to update post:', error);
      throw new Error(error.message || 'Failed to update post');
    }
  }

  /**
   * 删除文章
   */
  async deletePost(slug: string): Promise<void> {
    try {
      if (!this.octokit) throw new Error('Not authenticated');

      const filePath = `${this.config.path}${slug}.md`;
      
      // 先获取文件的 sha
      const { data: fileData } = await this.octokit.rest.repos.getContent({
        owner: this.config.owner,
        repo: this.config.repo,
        path: filePath,
      });

      if (Array.isArray(fileData) || !('sha' in fileData)) {
        throw new Error('Invalid response');
      }

      await this.octokit.rest.repos.deleteFile({
        owner: this.config.owner,
        repo: this.config.repo,
        path: filePath,
        message: `Delete post: ${slug}`,
        sha: fileData.sha,
      });
    } catch (error: any) {
      console.error('Failed to delete post:', error);
      throw new Error(error.message || 'Failed to delete post');
    }
  }

  /**
   * 批量删除文章
   */
  async deletePosts(slugs: string[]): Promise<void> {
    try {
      if (!this.octokit) throw new Error('Not authenticated');
      if (slugs.length === 0) return;

      // 并行删除所有文章
      await Promise.all(
        slugs.map(async (slug) => {
          const filePath = `${this.config.path}${slug}.md`;
          
          try {
            // 先获取文件的 sha
            const { data: fileData } = await this.octokit.rest.repos.getContent({
              owner: this.config.owner,
              repo: this.config.repo,
              path: filePath,
            });

            if (!Array.isArray(fileData) && 'sha' in fileData) {
              await this.octokit.rest.repos.deleteFile({
                owner: this.config.owner,
                repo: this.config.repo,
                path: filePath,
                message: `Delete post: ${slug}`,
                sha: fileData.sha,
              });
            }
          } catch (error: any) {
            console.error(`Failed to delete post ${slug}:`, error);
            // 忽略单个删除失败的错误，继续删除其他文章
          }
        })
      );
    } catch (error: any) {
      console.error('Failed to delete posts:', error);
      throw new Error(error.message || 'Failed to delete posts');
    }
  }

  /**
   * 解析 Markdown 内容为 BlogPost 对象
   */
  private parseMarkdown(content: string, slug?: string): BlogPost {
    const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
    const match = content.match(frontMatterRegex);

    if (!match) {
      // 没有 front matter，使用默认值
      return {
        slug: slug || 'untitled',
        title: 'Untitled',
        description: '',
        category: 'uncategorized',
        tags: [],
        date: new Date().toISOString(),
        readTime: this.calculateReadTime(content),
        content: content.trim(),
      };
    }

    const frontMatter = this.parseFrontMatter(match[1]);
    const bodyContent = match[2].trim();

    return {
      slug: slug || this.slugify(frontMatter.title || 'untitled'),
      title: frontMatter.title || 'Untitled',
      description: frontMatter.description || '',
      category: frontMatter.category || 'uncategorized',
      tags: frontMatter.tags || [],
      date: frontMatter.date || new Date().toISOString(),
      readTime: this.calculateReadTime(bodyContent),
      content: bodyContent,
      coverImage: frontMatter.coverImage,
      author: frontMatter.author,
    };
  }

  /**
   * 解析 front matter 字符串
   */
  private parseFrontMatter(frontMatterStr: string): Partial<PostFrontMatter> {
    const result: Partial<PostFrontMatter> = {};
    const lines = frontMatterStr.split('\n');

    for (const line of lines) {
      const colonIndex = line.indexOf(':');
      if (colonIndex === -1) continue;

      const key = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();

      // 移除引号
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }

      switch (key) {
        case 'title':
          result.title = value;
          break;
        case 'description':
          result.description = value;
          break;
        case 'category':
          result.category = value;
          break;
        case 'tags':
          result.tags = value.split(',').map(t => t.trim()).filter(Boolean);
          break;
        case 'date':
          result.date = value;
          break;
        case 'coverImage':
          result.coverImage = value;
          break;
        case 'author':
          result.author = value;
          break;
      }
    }

    return result;
  }

  /**
   * 将 BlogPost 序列化为 Markdown 字符串
   */
  private serializeMarkdown(post: BlogPost): string {
    const frontMatter = [
      '---',
      `title: "${post.title}"`,
      `description: "${post.description}"`,
      `category: "${post.category}"`,
      `tags: "${post.tags.join(', ')}"`,
      `date: "${post.date}"`,
    ];

    if (post.coverImage) {
      frontMatter.push(`coverImage: "${post.coverImage}"`);
    }

    if (post.author) {
      frontMatter.push(`author: "${post.author}"`);
    }

    frontMatter.push('---', '', post.content);

    return frontMatter.join('\n');
  }

  /**
   * 计算阅读时间
   */
  private calculateReadTime(content: string): string {
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  }

  /**
   * 将字符串转换为 slug
   */
  private slugify(str: string): string {
    return str
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}

// 创建单例实例
let githubService: GitHubService | null = null;

export const initGitHubService = (config: GitHubConfig): GitHubService => {
  githubService = new GitHubService(config);
  return githubService;
};

export const getGitHubService = (): GitHubService | null => {
  return githubService;
};

export const clearGitHubService = (): void => {
  githubService = null;
};
