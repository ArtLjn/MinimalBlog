import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Components } from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = '',
}) => {
  const components: Components = {
    code({ node, inline, className: codeClassName, children, ...props }: any) {
      const match = /language-(\w+)/.exec(codeClassName || '');
      return !inline && match ? (
        <SyntaxHighlighter
          style={oneDark}
          language={match[1]}
          PreTag="div"
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className={codeClassName} {...props}>
          {children}
        </code>
      );
    },
    h1: ({ children }) => (
      <h1 className="text-3xl md:text-4xl font-medium text-black dark:text-white mt-12 mb-6">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-2xl md:text-3xl font-medium text-black dark:text-white mt-10 mb-5">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl md:text-2xl font-medium text-black dark:text-white mt-8 mb-4">
        {children}
      </h3>
    ),
    p: ({ children }) => (
      <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
        {children}
      </p>
    ),
    a: ({ children, href }) => (
      <a
        href={href}
        className="text-[var(--color-primary-500)] hover:underline"
        target={href?.startsWith('http') ? '_blank' : undefined}
        rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
      >
        {children}
      </a>
    ),
    ul: ({ children }) => (
      <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mb-6 space-y-2">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside text-gray-600 dark:text-gray-400 mb-6 space-y-2">
        {children}
      </ol>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-[var(--color-primary-500)] pl-6 py-2 my-8 bg-gray-50 dark:bg-gray-800/50 rounded-r-lg">
        <p className="text-gray-700 dark:text-gray-300 italic m-0">{children}</p>
      </blockquote>
    ),
    img: ({ src, alt }) => {
      if (!src) return null;
      return (
        <img
          src={src}
          alt={alt}
          className="w-full rounded-xl my-8"
          loading="lazy"
        />
      );
    },
    hr: () => (
      <hr className="border-gray-200 dark:border-gray-700 my-10" />
    ),
    table: ({ children }) => (
      <div className="overflow-x-auto my-8">
        <table className="w-full border-collapse">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="bg-gray-100 dark:bg-gray-800">
        {children}
      </thead>
    ),
    th: ({ children }) => (
      <th className="px-4 py-3 text-left text-sm font-medium text-black dark:text-white border-b border-gray-200 dark:border-gray-700">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
        {children}
      </td>
    ),
  };

  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
