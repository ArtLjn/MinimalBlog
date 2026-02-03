import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Zap, Shield, Globe, Code, PenLine } from 'lucide-react';

const features = [
  {
    icon: Sparkles,
    title: '极简设计',
    description: '采用 Apple-style 极简美学，让内容成为焦点，提供沉浸式阅读体验。',
  },
  {
    icon: Zap,
    title: '极速加载',
    description: '基于静态站点生成，无需服务器，全球 CDN 加速，毫秒级加载。',
  },
  {
    icon: Shield,
    title: '安全可靠',
    description: '内容存储在 GitHub，版本控制、备份恢复一应俱全。',
  },
  {
    icon: Globe,
    title: '全球访问',
    description: '无服务器架构，全球任意地点都能快速访问您的内容。',
  },
  {
    icon: Code,
    title: '开发者友好',
    description: 'Markdown 格式，Git 工作流，开发者熟悉的写作方式。',
  },
  {
    icon: PenLine,
    title: '优雅编辑',
    description: '内置 Markdown 编辑器，实时预览，Front-matter 支持。',
  },
];

const stats = [
  { value: '100%', label: '开源免费' },
  { value: '0', label: '服务器成本' },
  { value: '<1s', label: '部署时间' },
  { value: '∞', label: '可扩展性' },
];

export const About: React.FC = () => {
  return (
    <main className="min-h-screen pt-24 pb-16">
      {/* Hero */}
      <section className="section-container mb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <span className="inline-block px-4 py-1.5 bg-[var(--color-primary-500)]/10 text-[var(--color-primary-500)] text-sm font-medium rounded-full mb-6">
            关于我们
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium text-black dark:text-white mb-6">
            重新定义
            <br />
            <span className="text-[var(--color-primary-500)]">博客体验</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            Minimal Blog 是一个开源的无服务器静态博客系统，融合了 Apple-style 极简美学与现代化的无服务器架构。
            通过 GitHub 管理内容，让写作回归纯粹。
          </p>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="section-container mb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl font-semibold text-black dark:text-white mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="section-container mb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-medium text-black dark:text-white mb-4">
            核心特性
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            为现代创作者打造的专业博客工具
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl hover:shadow-lg transition-shadow"
            >
              <div className="w-12 h-12 bg-[var(--color-primary-500)]/10 rounded-xl flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-[var(--color-primary-500)]" />
              </div>
              <h3 className="text-lg font-medium text-black dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section className="section-container mb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gray-50 dark:bg-gray-800/50 rounded-3xl p-8 md:p-12"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-medium text-black dark:text-white mb-4">
              技术栈
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              基于现代 Web 技术构建
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Framer Motion', 'Octokit', 'GitHub API'].map((tech) => (
              <span
                key={tech}
                className="px-4 py-2 bg-white dark:bg-gray-900 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
              >
                {tech}
              </span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-3xl md:text-4xl font-medium text-black dark:text-white mb-6">
            准备好开始了吗？
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-xl mx-auto">
            立即部署您自己的极简博客，体验无服务器架构带来的自由和便捷。
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              查看源码
            </a>
            <a
              href="/admin"
              className="btn-secondary"
            >
              立即开始
            </a>
          </div>
        </motion.div>
      </section>
    </main>
  );
};
