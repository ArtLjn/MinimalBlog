import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { BlogCategory } from '@/types';
import { getCategoryService } from '@/services/category';

interface BlogTabsProps {
  activeCategory: BlogCategory;
  onCategoryChange: (category: BlogCategory) => void;
}

export const BlogTabs: React.FC<BlogTabsProps> = ({
  activeCategory,
  onCategoryChange,
}) => {
  const [, setHoveredCategory] = useState<BlogCategory | null>(null);
  const [categories, setCategories] = useState<Array<{ id: string; label: string }>>([]);

  useEffect(() => {
    const loadCategories = async () => {
      const categoryService = getCategoryService();
      await categoryService.loadCategories();
      const categoriesWithAll = categoryService.getCategoriesWithAll();
      setCategories(categoriesWithAll);
    };

    loadCategories();
  }, []);

  return (
    <div className="relative flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-full w-fit">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          onMouseEnter={() => setHoveredCategory(category.id)}
          onMouseLeave={() => setHoveredCategory(null)}
          className={`relative px-5 py-2 text-sm font-medium rounded-full transition-colors duration-200 ${
            activeCategory === category.id
              ? 'text-black'
              : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
          }`}
        >
          {activeCategory === category.id && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-[var(--color-primary-500)] rounded-full"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
          <span className="relative z-10">{category.label}</span>
        </button>
      ))}
    </div>
  );
};
