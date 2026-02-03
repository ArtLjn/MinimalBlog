import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, User, Twitter, Linkedin, Link as LinkIcon } from 'lucide-react';
import { MarkdownRenderer } from '@/components/blog/MarkdownRenderer';
import { getGitHubService } from '@/services/github';
import type { BlogPost as BlogPostType } from '@/types';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { toast } from 'sonner';

// 示例文章数据
const samplePosts: Record<string, BlogPostType> = {
  'minimal-design-principles': {
    slug: 'minimal-design-principles',
    title: '极简设计原则：少即是多的艺术',
    description: '探索极简设计的核心原则，学习如何通过减法创造更有影响力的视觉体验。',
    category: 'design',
    tags: ['design', 'minimalism', 'ui'],
    date: '2024-01-15T10:00:00Z',
    readTime: '5 min read',
    author: '张设计师',
    coverImage: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=1200&q=80',
    content: `# 极简设计原则：少即是多的艺术

在当今信息爆炸的时代，极简设计已经成为一种重要的设计哲学。它不仅仅是一种视觉风格，更是一种思维方式——通过去除多余的元素，让核心信息更加突出。

## 什么是极简设计？

极简设计（Minimalist Design）源于20世纪60年代的极简主义艺术运动。它的核心理念是：**去除一切不必要的元素，只保留最本质的内容**。

> "完美不是无可添加，而是无可删减。" —— 安托万·德·圣埃克苏佩里

## 极简设计的核心原则

### 1. 留白的力量

留白（Negative Space）是极简设计中最重要的元素之一。它不仅仅是空白，而是**有目的的沉默**。

- 让内容呼吸
- 引导用户视线
- 创造视觉层次

### 2. 有限的色彩 palette

极简设计通常使用有限的色彩：

- 主色调：1-2 种
- 辅助色：1-2 种
- 中性色：黑、白、灰

### 3. 清晰的排版

 typography 在极简设计中扮演着关键角色：

- 选择 1-2 种字体
- 建立清晰的层次结构
- 注重可读性

## 实践建议

1. **从内容开始**：先确定要传达的信息
2. **逐步删减**：问自己"这个元素是否必要？"
3. **保持一致性**：统一的设计语言
4. **注重细节**：每个像素都很重要

## 结语

极简设计不是简单的"少放东西"，而是**深思熟虑后的精简**。它要求设计师对内容有深刻的理解，知道什么该保留，什么该舍弃。

当你下次开始一个设计项目时，不妨尝试应用这些原则，体验"少即是多"的魅力。`,
  },
};

export const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPost = async () => {
      if (!slug) return;
      
      setLoading(true);
      
      const githubService = getGitHubService();
      if (githubService) {
        try {
          const githubPost = await githubService.getPost(slug);
          if (githubPost) {
            setPost(githubPost);
          } else {
            // 尝试从示例数据获取
            setPost(samplePosts[slug] || null);
          }
        } catch {
          setPost(samplePosts[slug] || null);
        }
      } else {
        setPost(samplePosts[slug] || null);
      }
      
      setLoading(false);
    };

    loadPost();
  }, [slug]);

  const handleShare = async (platform: 'twitter' | 'linkedin' | 'copy') => {
    const url = window.location.href;
    const text = post?.title || '';

    switch (platform) {
      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
          '_blank'
        );
        break;
      case 'linkedin':
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
          '_blank'
        );
        break;
      case 'copy':
        await navigator.clipboard.writeText(url);
        toast.success('链接已复制到剪贴板');
        break;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-[var(--color-primary-500)] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <h1 className="text-4xl font-medium text-black dark:text-white mb-4">文章未找到</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">抱歉，您访问的文章不存在或已被删除。</p>
        <Link to="/" className="btn-primary">
          返回首页
        </Link>
      </div>
    );
  }

  return (
    <article className="min-h-screen pt-24 pb-16">
      {/* Header */}
      <header className="section-container mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-gray-500 hover:text-black dark:hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            返回
          </button>

          {/* Category */}
          <span className="inline-block px-4 py-1.5 bg-[var(--color-primary-500)]/10 text-[var(--color-primary-500)] text-sm font-medium rounded-full mb-6">
            {post.category}
          </span>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-medium text-black dark:text-white mb-6 max-w-4xl">
            {post.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
            {post.author && (
              <span className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {post.author}
              </span>
            )}
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {format(new Date(post.date), 'yyyy年MM月dd日', { locale: zhCN })}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {post.readTime}
            </span>
          </div>
        </motion.div>
      </header>

      {/* Cover Image */}
      {post.coverImage && post.coverImage.trim() && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="section-container mb-16"
        >
          <div className="aspect-[21/9] rounded-2xl overflow-hidden">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        </motion.div>
      )}

      {/* Content */}
      <div className="section-container">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-12">
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <MarkdownRenderer content={post.content} />

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">标签</h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Share */}
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">分享文章</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleShare('twitter')}
                  className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-[#1DA1F2] hover:text-white transition-colors"
                  aria-label="Share on Twitter"
                >
                  <Twitter className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleShare('linkedin')}
                  className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-[#0A66C2] hover:text-white transition-colors"
                  aria-label="Share on LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleShare('copy')}
                  className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-[var(--color-primary-500)] hover:text-black transition-colors"
                  aria-label="Copy link"
                >
                  <LinkIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-8">
              {/* Author Card */}
              {post.author && (
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">作者</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[var(--color-primary-500)] rounded-full flex items-center justify-center">
                      <span className="text-lg font-medium text-black">
                        {post.author.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-black dark:text-white">{post.author}</div>
                      <div className="text-sm text-gray-500">内容创作者</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Newsletter */}
              <div className="p-6 bg-[var(--color-primary-500)]/10 rounded-2xl">
                <h3 className="font-medium text-black dark:text-white mb-2">订阅更新</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  获取最新文章和独家内容
                </p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="flex-1 px-4 py-2 bg-white dark:bg-gray-900 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                  />
                  <button className="px-4 py-2 bg-[var(--color-primary-500)] text-black text-sm font-medium rounded-lg hover:bg-[var(--color-primary-600)] transition-colors">
                    订阅
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
};
