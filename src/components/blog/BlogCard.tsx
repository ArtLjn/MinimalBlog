import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowUpRight } from 'lucide-react';
import type { BlogPost } from '@/types';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface BlogCardProps {
  post: BlogPost;
  index?: number;
}

export const BlogCard: React.FC<BlogCardProps> = ({ post, index = 0 }) => {
  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{ y: -8 }}
      className="blog-card group cursor-pointer"
    >
      <Link to={`/post/${post.slug}`} className="block">
        {/* Image */}
        <div className="relative aspect-[16/10] overflow-hidden">
          <motion.img
            src={post.coverImage && post.coverImage.trim() ? post.coverImage : `https://picsum.photos/seed/${post.slug}/800/500`}
            alt={post.title}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.08 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Category Badge */}
          <motion.span
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
            className="absolute top-4 left-4 px-3 py-1 bg-[var(--color-primary-500)] text-black text-xs font-medium rounded-full"
          >
            {post.category}
          </motion.span>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Meta */}
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {format(new Date(post.date), 'yyyy年MM月dd日', { locale: zhCN })}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {post.readTime}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-xl font-medium text-black dark:text-white mb-2 line-clamp-2 group-hover:text-[var(--color-primary-500)] transition-colors duration-200">
            {post.title}
          </h3>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-2 mb-4">
            {post.description}
          </p>

          {/* Read More */}
          <span className="inline-flex items-center gap-1 text-sm font-medium text-black dark:text-white group-hover:text-[var(--color-primary-500)] transition-colors">
            阅读更多
            <ArrowUpRight className="w-4 h-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </span>
        </div>
      </Link>
    </motion.article>
  );
};
