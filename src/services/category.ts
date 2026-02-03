import type { Category } from '@/types';
import { getGitHubService } from './github';

const CATEGORIES_FILE_NAME = 'categories.json';

// 默认分类
const DEFAULT_CATEGORIES: Category[] = [
  { id: 'design', label: '设计', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'development', label: '开发', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'marketing', label: '营销', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'business', label: '商业', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

export class CategoryService {
  private categories: Category[] = [];

  constructor() {
    // 构造函数中不加载数据，需要手动调用 loadCategories
  }

  /**
   * 加载分类数据
   */
  async loadCategories(): Promise<void> {
    const githubService = getGitHubService();
    if (!githubService || !githubService.config || !githubService.octokit) {
      // 如果没有 GitHub 服务或配置不完整，使用默认分类
      this.categories = DEFAULT_CATEGORIES;
      return;
    }

    try {
      // 构建分类文件路径，使用配置的文章存储路径
      // 确保路径格式正确，以斜杠结尾
      const path = githubService.config.path || '';
      const normalizedPath = path.endsWith('/') 
        ? path 
        : `${path}/`;
      const categoriesFilePath = `${normalizedPath}${CATEGORIES_FILE_NAME}`;
      
      // 尝试从 GitHub 仓库读取分类文件
      const { data } = await githubService.octokit.rest.repos.getContent({
        owner: githubService.config.owner || '',
        repo: githubService.config.repo || '',
        path: categoriesFilePath,
      });

      if (!Array.isArray(data) && 'content' in data) {
        const content = decodeURIComponent(escape(atob(data.content.replace(/\n/g, ''))));
        const parsedCategories = JSON.parse(content);
        // 验证分类数据，确保所有分类都有非空的id
        if (Array.isArray(parsedCategories)) {
          const validCategories = parsedCategories.filter((cat: any) => typeof cat.id === 'string' && cat.id.trim() !== '');
          if (validCategories.length > 0) {
            this.categories = validCategories;
          } else {
            // 如果没有有效的分类，使用默认分类
            this.categories = DEFAULT_CATEGORIES;
            // 只有在 GitHub 服务配置完整时才尝试保存
            if (githubService.config.owner && githubService.config.repo) {
              await this.saveCategories();
            }
          }
        } else {
          // 如果解析结果不是数组，使用默认分类
          this.categories = DEFAULT_CATEGORIES;
          // 只有在 GitHub 服务配置完整时才尝试保存
          if (githubService.config.owner && githubService.config.repo) {
            await this.saveCategories();
          }
        }
      } else {
        // 如果文件不存在或格式不正确，使用默认分类
        this.categories = DEFAULT_CATEGORIES;
        // 只有在 GitHub 服务配置完整时才尝试保存
        if (githubService.config.owner && githubService.config.repo) {
          await this.saveCategories();
        }
      }
    } catch (error: any) {
      if (error.status === 404) {
        // 文件不存在，使用默认分类并创建文件
        this.categories = DEFAULT_CATEGORIES;
        // 只有在 GitHub 服务配置完整时才尝试保存
        if (githubService.config.owner && githubService.config.repo) {
          await this.saveCategories();
        }
      } else {
        // 其他错误，使用默认分类
        this.categories = DEFAULT_CATEGORIES;
      }
    }
  }

  /**
   * 保存分类数据到 GitHub 仓库
   */
  async saveCategories(): Promise<void> {
    const githubService = getGitHubService();
    if (!githubService || !githubService.config || !githubService.octokit) {
      throw new Error('GitHub service not initialized or configured');
    }

    // 确保配置完整
    if (!githubService.config.owner || !githubService.config.repo) {
      throw new Error('GitHub repository configuration is incomplete');
    }

    try {
      const content = JSON.stringify(this.categories, null, 2);
      const encodedContent = btoa((unescape as any)(encodeURIComponent(content)));

      // 构建分类文件路径，使用配置的文章存储路径
      // 确保路径格式正确，以斜杠结尾
      const path = githubService.config.path || '';
      const normalizedPath = path.endsWith('/') 
        ? path 
        : `${path}/`;
      const categoriesFilePath = `${normalizedPath}${CATEGORIES_FILE_NAME}`;

      // 尝试获取文件信息（用于获取 sha）
      let sha: string | undefined;
      try {
        const { data } = await githubService.octokit.rest.repos.getContent({
          owner: githubService.config.owner,
          repo: githubService.config.repo,
          path: categoriesFilePath,
        });

        if (!Array.isArray(data) && 'sha' in data) {
          sha = data.sha;
        }
      } catch (error: any) {
        // 文件不存在，这是正常的，忽略错误
        if (error.status !== 404) {
          // 其他错误需要抛出
          throw error;
        }
      }

      // 创建或更新文件
      await githubService.octokit.rest.repos.createOrUpdateFileContents({
        owner: githubService.config.owner,
        repo: githubService.config.repo,
        path: categoriesFilePath,
        message: 'Update categories',
        content: encodedContent,
        sha, // 新建文件时为 undefined，更新文件时为实际的 sha
      });
    } catch (error: any) {
      throw new Error(`Failed to save categories: ${error.message}`);
    }
  }

  /**
   * 获取所有分类
   */
  getAllCategories(): Category[] {
    return this.categories;
  }

  /**
   * 获取分类（包含 'all' 选项）
   */
  getCategoriesWithAll(): Array<Category & { id: string }> {
    return [
      { id: 'all', label: '全部', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      ...this.categories,
    ];
  }

  /**
   * 根据 ID 获取分类
   */
  getCategoryById(id: string): Category | undefined {
    return this.categories.find(category => category.id === id);
  }

  /**
   * 创建新分类
   */
  async createCategory(label: string): Promise<Category> {
    const id = this.slugify(label);
    
    // 检查分类是否已存在
    if (this.getCategoryById(id)) {
      throw new Error('分类已存在');
    }

    const now = new Date().toISOString();
    const newCategory: Category = {
      id,
      label,
      createdAt: now,
      updatedAt: now,
    };

    this.categories.push(newCategory);
    
    // 尝试保存到 GitHub，但即使失败也返回新分类
    // 这样可以确保 UI 能够正常更新，即使 GitHub 保存失败
    try {
      await this.saveCategories();
    } catch (error) {
      // 忽略保存错误，使用默认分类
      console.error('Failed to save category to GitHub:', error);
    }
    
    return newCategory;
  }

  /**
   * 更新分类
   */
  async updateCategory(id: string, label: string): Promise<Category> {
    const categoryIndex = this.categories.findIndex(category => category.id === id);
    
    if (categoryIndex === -1) {
      throw new Error('分类不存在');
    }

    const updatedId = this.slugify(label);
    
    // 检查新 ID 是否与其他分类冲突
    if (updatedId !== id && this.getCategoryById(updatedId)) {
      throw new Error('分类名称已存在');
    }

    const updatedCategory = {
      ...this.categories[categoryIndex],
      id: updatedId,
      label,
      updatedAt: new Date().toISOString(),
    };

    this.categories[categoryIndex] = updatedCategory;
    
    // 尝试保存到 GitHub，但即使失败也返回更新后的分类
    try {
      await this.saveCategories();
    } catch (error) {
      // 忽略保存错误，使用更新后的分类
      console.error('Failed to update category on GitHub:', error);
    }
    
    return updatedCategory;
  }

  /**
   * 删除分类
   */
  async deleteCategory(id: string): Promise<void> {
    const categoryIndex = this.categories.findIndex(category => category.id === id);
    
    if (categoryIndex === -1) {
      throw new Error('分类不存在');
    }

    this.categories.splice(categoryIndex, 1);
    
    // 尝试保存到 GitHub，但即使失败也继续执行
    try {
      await this.saveCategories();
    } catch (error) {
      // 忽略保存错误
      console.error('Failed to delete category from GitHub:', error);
    }
  }

  /**
   * 批量删除分类
   */
  async deleteCategories(ids: string[]): Promise<void> {
    if (ids.length === 0) return;

    // 从本地分类列表中移除所有要删除的分类
    this.categories = this.categories.filter(category => !ids.includes(category.id));
    
    // 尝试保存到 GitHub，但即使失败也继续执行
    try {
      await this.saveCategories();
    } catch (error) {
      // 忽略保存错误
      console.error('Failed to delete categories from GitHub:', error);
    }
  }

  /**
   * 将字符串转换为 slug
   */
  private slugify(str: string): string {
    const slug = str
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return slug || 'uncategorized';
  }
}

// 创建单例实例
let categoryService: CategoryService | null = null;

export const initCategoryService = (): CategoryService => {
  if (!categoryService) {
    categoryService = new CategoryService();
  }
  return categoryService;
};

export const getCategoryService = (): CategoryService => {
  if (!categoryService) {
    categoryService = new CategoryService();
  }
  return categoryService;
};

export const clearCategoryService = (): void => {
  categoryService = null;
};
