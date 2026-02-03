import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BlogCard } from '@/components/blog/BlogCard';
import { BlogTabs } from '@/components/blog/BlogTabs';
import { getGitHubService } from '@/services/github';
import type { BlogPost, BlogCategory } from '@/types';
import { Loader2 } from 'lucide-react';

// 示例文章数据（当 GitHub 未配置时使用）
const samplePosts: BlogPost[] = [
  {
    slug: 'minimal-design-principles',
    title: '极简设计原则：少即是多的艺术',
    description: '探索极简设计的核心原则，学习如何通过减法创造更有影响力的视觉体验。',
    category: 'design',
    tags: ['design', 'minimalism', 'ui'],
    date: '2024-01-15T10:00:00Z',
    readTime: '5 min read',
    content: '',
    coverImage: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=800&q=80',
  },
  {
    slug: 'react-server-components',
    title: '深入理解 React Server Components',
    description: '全面解析 React Server Components 的工作原理和最佳实践。',
    category: 'development',
    tags: ['react', 'javascript', 'frontend'],
    date: '2024-01-12T14:30:00Z',
    readTime: '8 min read',
    content: '',
    coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80',
  },
  {
    slug: 'content-marketing-strategy',
    title: '2024年内容营销策略指南',
    description: '了解如何制定有效的内容营销策略，提升品牌影响力和用户参与度。',
    category: 'marketing',
    tags: ['marketing', 'strategy', 'content'],
    date: '2024-01-10T09:00:00Z',
    readTime: '6 min read',
    content: '',
    coverImage: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
  },
  {
    slug: 'building-saas-startup',
    title: '从零开始构建 SaaS 创业公司的经验',
    description: '分享我在构建 SaaS 创业公司过程中的经验教训和实用建议。',
    category: 'business',
    tags: ['startup', 'saas', 'business'],
    date: '2024-01-08T16:00:00Z',
    readTime: '10 min read',
    content: '',
    coverImage: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&q=80',
  },
  {
    slug: 'typescript-best-practices',
    title: 'TypeScript 最佳实践：编写可维护的代码',
    description: '学习如何使用 TypeScript 编写更健壮、更可维护的代码。',
    category: 'development',
    tags: ['typescript', 'javascript', 'best-practices'],
    date: '2024-01-05T11:00:00Z',
    readTime: '7 min read',
    content: '',
    coverImage: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80',
  },
  {
    slug: 'ui-design-trends-2024',
    title: '2024年 UI 设计趋势预测',
    description: '探索即将主导 2024 年的 UI 设计趋势和新兴技术。',
    category: 'design',
    tags: ['design', 'trends', 'ui'],
    date: '2024-01-03T13:00:00Z',
    readTime: '5 min read',
    content: '',
    coverImage: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80',
  },
];

export const BlogSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<BlogCategory>('all');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPosts = async () => {
    setLoading(true);
    
    const githubService = getGitHubService();
    if (githubService) {
      try {
        const githubPosts = await githubService.getPosts();
        if (githubPosts.length > 0) {
          setPosts(githubPosts);
        } else {
          setPosts(samplePosts);
        }
      } catch {
        setPosts(samplePosts);
      }
    } else {
      // 使用示例数据
      setPosts(samplePosts);
    }
    
    setLoading(false);
  };

  // 首次加载时获取数据
  useEffect(() => {
    loadPosts();
  }, []);

  // 监听 URL 变化，当从管理后台返回时刷新数据
  useEffect(() => {
    const handlePopState = () => {
      loadPosts();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // 每 30 秒自动刷新一次数据，确保数据与 GitHub 同步
  useEffect(() => {
    const interval = setInterval(() => {
      loadPosts();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const filteredPosts = activeCategory === 'all'
    ? posts
    : posts.filter(post => post.category === activeCategory);

  return (
    <section id="blog" className="py-24 md:py-32">
      <div className="section-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium text-black dark:text-white mb-4">
            精选文章
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            探索我们精心挑选的各分类最佳内容，发现触动心灵的故事和见解
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex justify-center mb-12"
        >
          <BlogTabs
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        </motion.div>

        {/* Posts Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary-500)]" />
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          >
            {filteredPosts.map((post, index) => (
              <BlogCard key={post.slug} post={post} index={index} />
            ))}
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && filteredPosts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-gray-500">该分类暂无文章</p>
          </motion.div>
        )}
      </div>
    </section>
  );
};
