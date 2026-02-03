import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
        <div className="my-6 rounded-lg overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-4 py-2 bg-gray-900 text-gray-400 text-xs font-mono">
            <span>{match[1]}</span>
          </div>
          <SyntaxHighlighter
            style={oneDark}
            language={match[1]}
            PreTag="div"
            showLineNumbers
            lineNumberStyle={{ color: '#6b7280', fontSize: '0.8rem', paddingRight: '1rem' }}
            customStyle={{
              margin: 0,
              padding: '1.5rem',
              borderRadius: '0 0 0.5rem 0.5rem',
              fontSize: '0.9rem',
              lineHeight: '1.5',
            }}
            {...props}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        </div>
      ) : (
        <code 
          className={`px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono ${codeClassName || ''}`} 
          {...props}
        >
          {children}
        </code>
      );
    },
    h1: ({ children }) => {
      const id = String(children).toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
      return (
        <h1 
          id={id}
          className="text-3xl md:text-4xl lg:text-5xl font-semibold text-black dark:text-white mt-16 mb-8 pb-3 border-b border-gray-200 dark:border-gray-700"
        >
          {children}
        </h1>
      );
    },
    h2: ({ children }) => {
      const id = String(children).toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
      return (
        <h2 
          id={id}
          className="text-2xl md:text-3xl font-semibold text-black dark:text-white mt-14 mb-6 pb-2 border-b border-gray-200 dark:border-gray-700"
        >
          {children}
        </h2>
      );
    },
    h3: ({ children }) => {
      const id = String(children).toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
      return (
        <h3 
          id={id}
          className="text-xl md:text-2xl font-semibold text-black dark:text-white mt-12 mb-4"
        >
          {children}
        </h3>
      );
    },
    h4: ({ children }) => {
      const id = String(children).toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
      return (
        <h4 
          id={id}
          className="text-lg md:text-xl font-semibold text-black dark:text-white mt-10 mb-4"
        >
          {children}
        </h4>
      );
    },
    h5: ({ children }) => {
      const id = String(children).toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
      return (
        <h5 
          id={id}
          className="text-base md:text-lg font-semibold text-black dark:text-white mt-8 mb-3"
        >
          {children}
        </h5>
      );
    },
    h6: ({ children }) => {
      const id = String(children).toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
      return (
        <h6 
          id={id}
          className="text-sm md:text-base font-semibold text-black dark:text-white mt-6 mb-3"
        >
          {children}
        </h6>
      );
    },
    p: ({ children }) => (
      <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 text-base">
        {children}
      </p>
    ),
    a: ({ children, href, title }) => (
      <a
        href={href}
        title={title}
        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline transition-colors font-medium"
        target={href?.startsWith('http') ? '_blank' : undefined}
        rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
      >
        {children}
      </a>
    ),
    ul: ({ children }) => (
      <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-6 space-y-2">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal pl-6 text-gray-700 dark:text-gray-300 mb-6 space-y-2">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="leading-relaxed">
        {children}
      </li>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-[var(--color-primary-500)] pl-6 py-4 my-8 bg-gray-50 dark:bg-gray-800/50 rounded-r-lg">
        <p className="text-gray-700 dark:text-gray-300 italic m-0 leading-relaxed">{children}</p>
      </blockquote>
    ),
    img: ({ src, alt, title }) => {
      if (!src) return null;
      return (
        <figure className="my-10">
          <img
            src={src}
            alt={alt || ''}
            title={title || undefined}
            className="w-full h-auto rounded-xl shadow-md hover:shadow-lg transition-shadow"
            loading="lazy"
          />
          {alt && (
            <figcaption className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
              {alt}
            </figcaption>
          )}
        </figure>
      );
    },
    hr: () => (
      <hr className="border-gray-200 dark:border-gray-700 my-12" />
    ),
    table: ({ children }) => (
      <div className="overflow-x-auto my-8 rounded-lg shadow-sm">
        <table className="w-full border-collapse bg-white dark:bg-gray-900">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="bg-gray-50 dark:bg-gray-800">
        {children}
      </thead>
    ),
    th: ({ children }) => (
      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
        {children}
      </td>
    ),
    strong: ({ children }) => (
      <strong className="font-semibold text-gray-900 dark:text-white">
        {children}
      </strong>
    ),
    em: ({ children }) => (
      <em className="italic text-gray-700 dark:text-gray-300">
        {children}
      </em>
    ),
  };

  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
