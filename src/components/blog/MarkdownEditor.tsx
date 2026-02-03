import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import TextareaAutosize from 'react-textarea-autosize';
import {
  Bold,
  Italic,
  Link,
  Image,
  Code,
  List,
  ListOrdered,
  Quote,
  Heading,
  Save,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MarkdownRenderer } from './MarkdownRenderer';
import { getCategoryService } from '@/services/category';
import type { BlogPost, Category } from '@/types';

interface MarkdownEditorProps {
  initialPost?: Partial<BlogPost>;
  onSave: (post: BlogPost) => Promise<void>;
  onPublish: (post: BlogPost) => Promise<void>;
  isLoading?: boolean;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  initialPost,
  onSave,
  onPublish,
  isLoading = false,
}) => {
  const [title, setTitle] = useState(initialPost?.title || '');
  const [description, setDescription] = useState(initialPost?.description || '');
  const [category, setCategory] = useState(initialPost?.category || '');
  const [tags, setTags] = useState(initialPost?.tags?.join(', ') || '');
  const [coverImage, setCoverImage] = useState(initialPost?.coverImage || '');
  const [content, setContent] = useState(initialPost?.content || '');
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [categories, setCategories] = useState<Category[]>([]);

  // 自动保存草稿到 localStorage
  useEffect(() => {
    const draft = {
      title,
      description,
      category,
      tags,
      coverImage,
      content,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem('blog_draft', JSON.stringify(draft));
  }, [title, description, category, tags, coverImage, content]);

  // 恢复草稿
  useEffect(() => {
    if (!initialPost?.title) {
      const saved = localStorage.getItem('blog_draft');
      if (saved) {
        try {
          const draft = JSON.parse(saved);
          setTitle(draft.title || '');
          setDescription(draft.description || '');
          setCategory(draft.category || '');
          setTags(draft.tags || '');
          setCoverImage(draft.coverImage || '');
          setContent(draft.content || '');
        } catch {
          // 忽略解析错误
        }
      }
    }
  }, [initialPost]);

  // 加载分类列表
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoryService = getCategoryService();
        await categoryService.loadCategories();
        const categoriesList = categoryService.getAllCategories();
        setCategories(categoriesList);
        
        // 如果当前分类为空且有分类可用，设置默认分类
        if (!category && categoriesList.length > 0) {
          setCategory(categoriesList[0].id);
        } else if (category && !categoriesList.some(cat => cat.id === category) && categoriesList.length > 0) {
          // 如果当前选中的分类不存在于分类列表中，则设置为第一个分类
          setCategory(categoriesList[0].id);
        }
      } catch (error) {
        console.error('加载分类失败:', error);
      }
    };

    loadCategories();
  }, []);

  const insertMarkdown = useCallback((before: string, after: string = '') => {
    const textarea = document.getElementById('markdown-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const newText = content.substring(0, start) + before + selectedText + after + content.substring(end);
    
    setContent(newText);
    
    // 恢复焦点
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }, [content]);

  const toolbarItems = [
    { icon: Bold, action: () => insertMarkdown('**', '**'), label: '粗体' },
    { icon: Italic, action: () => insertMarkdown('*', '*'), label: '斜体' },
    { icon: Heading, action: () => insertMarkdown('## ', ''), label: '标题' },
    { icon: Link, action: () => insertMarkdown('[', '](url)'), label: '链接' },
    { icon: Image, action: () => insertMarkdown('![alt](', ')'), label: '图片' },
    { icon: Code, action: () => insertMarkdown('```\n', '\n```'), label: '代码块' },
    { icon: List, action: () => insertMarkdown('- ', ''), label: '无序列表' },
    { icon: ListOrdered, action: () => insertMarkdown('1. ', ''), label: '有序列表' },
    { icon: Quote, action: () => insertMarkdown('> ', ''), label: '引用' },
  ];

  const buildPost = (): BlogPost => {
    const slug = initialPost?.slug || title.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return {
      slug,
      title: title || 'Untitled',
      description: description || '',
      category: category || 'uncategorized',
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      date: initialPost?.date || new Date().toISOString(),
      readTime: `${Math.ceil(content.split(/\s+/).length / 200)} min read`,
      content,
      coverImage: coverImage || undefined,
    };
  };

  const handleSave = async () => {
    await onSave(buildPost());
  };

  const handlePublish = async () => {
    await onPublish(buildPost());
    localStorage.removeItem('blog_draft');
  };

  return (
    <div className="space-y-6">
      {/* Front Matter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4 bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">标题</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="文章标题"
              className="bg-white dark:bg-gray-900"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">分类</Label>
            <Select value={category || ""} onValueChange={setCategory} disabled={categories.length === 0}>
              <SelectTrigger id="category" className="w-full bg-white dark:bg-gray-900">
                <SelectValue placeholder={categories.length === 0 ? "加载分类中..." : "选择分类"} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">描述</Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="简短描述文章内容"
            className="bg-white dark:bg-gray-900"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tags">标签（用逗号分隔）</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="react, typescript, web"
              className="bg-white dark:bg-gray-900"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="coverImage">封面图片 URL</Label>
            <Input
              id="coverImage"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="bg-white dark:bg-gray-900"
            />
          </div>
        </div>
      </motion.div>

      {/* Editor Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
          {toolbarItems.map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className="p-2 rounded-md hover:bg-white dark:hover:bg-gray-700 transition-colors"
              title={item.label}
            >
              <item.icon className="w-4 h-4" />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('edit')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'edit'
                ? 'bg-[var(--color-primary-500)] text-black'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            编辑
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'preview'
                ? 'bg-[var(--color-primary-500)] text-black'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            预览
          </button>
        </div>
      </div>

      {/* Editor / Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: activeTab === 'edit' ? 1 : 0, display: activeTab === 'edit' ? 'block' : 'none' }}
          className="min-h-[500px]"
        >
          <TextareaAutosize
            id="markdown-editor"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="开始写作..."
            className="w-full min-h-[500px] p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] font-mono text-sm leading-relaxed"
          />
        </motion.div>

        {/* Preview */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: activeTab === 'preview' ? 1 : 1, display: activeTab === 'preview' ? 'block' : 'none' }}
          className="min-h-[500px] p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-auto"
        >
          {content ? (
            <MarkdownRenderer content={content} />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              <p>预览将显示在这里</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
        <Button
          variant="outline"
          onClick={handleSave}
          disabled={isLoading}
          className="gap-2"
        >
          <Save className="w-4 h-4" />
          保存草稿
        </Button>
        <Button
          onClick={handlePublish}
          disabled={isLoading || !title}
          className="gap-2 bg-[var(--color-primary-500)] text-black hover:bg-[var(--color-primary-600)]"
        >
          <Send className="w-4 h-4" />
          {isLoading ? '发布中...' : '发布文章'}
        </Button>
      </div>
    </div>
  );
};
