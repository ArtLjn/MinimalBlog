import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

const titleWords = ['探索', '精彩', '故事'];

export const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-500)]/10 via-transparent to-[var(--color-primary-400)]/5 animate-gradient-shift" />
      
      {/* Decorative Elements */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-1/4 right-1/4 w-64 h-64 bg-[var(--color-primary-500)]/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          y: [0, 20, 0],
          rotate: [0, -5, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-[var(--color-primary-400)]/20 rounded-full blur-3xl"
      />

      <div className="section-container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Content */}
          <div className="max-w-xl">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-primary-500)]/10 rounded-full mb-8"
            >
              <Sparkles className="w-4 h-4 text-[var(--color-primary-500)]" />
              <span className="text-sm font-medium text-black dark:text-white">
                极简博客系统
              </span>
            </motion.div>

            {/* Title */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-medium leading-tight mb-6">
              {titleWords.map((word, wordIndex) => (
                <span key={wordIndex} className="inline-block mr-4">
                  {word.split('').map((char, charIndex) => (
                    <motion.span
                      key={charIndex}
                      initial={{ 
                        opacity: 0, 
                        y: 40, 
                        rotateX: -30,
                      }}
                      animate={{ 
                        opacity: 1, 
                        y: 0, 
                        rotateX: 0,
                      }}
                      transition={{
                        duration: 0.6,
                        delay: 0.2 + wordIndex * 0.15 + charIndex * 0.03,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className={`inline-block ${
                        wordIndex === 2 
                          ? 'text-[var(--color-primary-500)]' 
                          : 'text-black dark:text-white'
                      }`}
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      {char}
                    </motion.span>
                  ))}
                </span>
              ))}
            </h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, filter: 'blur(10px)', y: 20 }}
              animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
              transition={{ duration: 0.6, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-8"
            >
              发现触动心灵、激发灵感、引发共鸣的故事。我们的博客汇集了来自世界各地作家、思想家和创作者的真实体验与深刻见解。
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-wrap items-center gap-4"
            >
              <Link
                to="/#blog"
                className="btn-primary gap-2 group"
              >
                开始阅读
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/about"
                className="btn-secondary"
              >
                了解更多
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-8 mt-12 pt-8 border-t border-gray-200 dark:border-gray-800"
            >
              <div>
                <div className="text-3xl font-semibold text-black dark:text-white">100+</div>
                <div className="text-sm text-gray-500">精选文章</div>
              </div>
              <div>
                <div className="text-3xl font-semibold text-black dark:text-white">50+</div>
                <div className="text-sm text-gray-500">活跃作者</div>
              </div>
              <div>
                <div className="text-3xl font-semibold text-black dark:text-white">10K+</div>
                <div className="text-sm text-gray-500">月阅读量</div>
              </div>
            </motion.div>
          </div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, clipPath: 'inset(100% 0 0 0)' }}
            animate={{ opacity: 1, clipPath: 'inset(0% 0 0 0)' }}
            transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative hidden lg:block"
          >
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
              <motion.img
                src="https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&q=80"
                alt="Reading"
                className="w-full h-full object-cover"
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.2, delay: 0.4, ease: 'easeOut' }}
              />
              
              {/* Floating Card */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 1 }}
                className="absolute -left-8 bottom-20 glass-card rounded-xl p-4 shadow-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[var(--color-primary-500)] rounded-full flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-black" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-black dark:text-white">新文章发布</div>
                    <div className="text-xs text-gray-500">刚刚</div>
                  </div>
                </div>
              </motion.div>

              {/* Decorative Dot */}
              <motion.div
                animate={{
                  y: [0, -15, 0],
                  rotate: [0, 10, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute -right-4 top-20 w-20 h-20 bg-[var(--color-primary-500)] rounded-full"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
