import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PenLine, Twitter, Linkedin, Instagram, Github } from 'lucide-react';

const footerLinks = {
  product: {
    title: '产品',
    links: [
      { label: '功能', href: '#' },
      { label: '定价', href: '#' },
      { label: '集成', href: '#' },
    ],
  },
  company: {
    title: '公司',
    links: [
      { label: '关于', href: '/about' },
      { label: '博客', href: '/#blog' },
      { label: '招聘', href: '#' },
    ],
  },
  resources: {
    title: '资源',
    links: [
      { label: '文档', href: '#' },
      { label: '帮助中心', href: '#' },
      { label: '社区', href: '#' },
    ],
  },
  legal: {
    title: '法律',
    links: [
      { label: '隐私', href: '#' },
      { label: '条款', href: '#' },
      { label: 'Cookie', href: '#' },
    ],
  },
};

const socialLinks = [
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Github, href: '#', label: 'GitHub' },
];

export const Footer: React.FC = () => {
  return (
    <footer className="bg-black text-white">
      <div className="section-container py-16 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 md:gap-12">
          {/* Logo & Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="col-span-2"
          >
            <Link to="/" className="flex items-center gap-2 text-xl font-semibold mb-4">
              <span className="w-8 h-8 bg-[var(--color-primary-500)] rounded-full flex items-center justify-center">
                <PenLine className="w-4 h-4 text-black" />
              </span>
              <span>Minimal</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              一个极简、时尚的无服务器静态博客系统。通过 GitHub 管理内容，让写作回归纯粹。
            </p>
          </motion.div>

          {/* Links */}
          {Object.entries(footerLinks).map(([key, section], sectionIndex) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * (sectionIndex + 1) }}
            >
              <h4 className="font-medium text-sm mb-4">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-gray-400 text-sm hover:text-[var(--color-primary-500)] transition-colors relative group"
                    >
                      {link.label}
                      <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-[var(--color-primary-500)] transition-all duration-200 group-hover:w-full" />
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-16 pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Minimal Blog. All rights reserved.
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social, index) => (
              <motion.a
                key={social.label}
                href={social.href}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.4,
                  delay: 0.7 + index * 0.1,
                  type: 'spring',
                  stiffness: 260,
                  damping: 20,
                }}
                whileHover={{ y: -4 }}
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-[var(--color-primary-500)] hover:bg-gray-700 transition-colors"
                aria-label={social.label}
              >
                <social.icon className="w-4 h-4" />
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>
    </footer>
  );
};
