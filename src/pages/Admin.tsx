import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, Eye, EyeOff, Loader2, FileText, Plus, LogOut, Trash2, Edit, X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MarkdownEditor } from '@/components/blog/MarkdownEditor';
import { useAuth } from '@/context/AuthContext';
import { getGitHubService } from '@/services/github';
import { getCategoryService } from '@/services/category';
import type { BlogPost, Category } from '@/types';
import { toast } from 'sonner';

export const Admin: React.FC = () => {
  const { isAuthenticated, user, login, logout } = useAuth();
  const [token, setToken] = useState('');
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  const [path, setPath] = useState('posts/');
  const [showToken, setShowToken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'posts' | 'categories'>('editor');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editingPost, setEditingPost] = useState<Partial<BlogPost> | undefined>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectAllCategories, setSelectAllCategories] = useState(false);

  // 加载已保存的配置
  useEffect(() => {
    const saved = localStorage.getItem('blog_github_config');
    if (saved) {
      try {
        const config = JSON.parse(saved);
        setOwner(config.owner || '');
        setRepo(config.repo || '');
        setPath(config.path || 'posts/');
      } catch {
        // 忽略解析错误
      }
    }
  }, []);

  // 加载文章列表
  useEffect(() => {
    if (isAuthenticated) {
      loadPosts();
    }
  }, [isAuthenticated]);

  // 加载分类列表
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoryService = getCategoryService();
        await categoryService.loadCategories();
        const categoriesList = categoryService.getAllCategories();
        setCategories(categoriesList);
      } catch (error) {
        console.error('加载分类失败:', error);
        toast.error('加载分类失败');
      }
    };

    loadCategories();
  }, [activeTab]);

  const loadPosts = async () => {
    const githubService = getGitHubService();
    if (githubService) {
      try {
        const loadedPosts = await githubService.getPosts();
        setPosts(loadedPosts);
      } catch (error) {
        toast.error('加载文章失败');
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const success = await login(token, owner, repo, path);
    
    if (success) {
      toast.success('登录成功');
    } else {
      toast.error('登录失败，请检查配置');
    }
    
    setLoading(false);
  };

  const handleSave = async (post: BlogPost) => {
    const githubService = getGitHubService();
    if (!githubService) return;

    try {
      if (editingPost?.slug) {
        await githubService.updatePost(post);
        toast.success('文章已更新');
      } else {
        await githubService.createPost(post);
        toast.success('文章已创建');
      }
      loadPosts();
    } catch (error: any) {
      toast.error(error.message || '保存失败');
    }
  };

  const handlePublish = async (post: BlogPost) => {
    await handleSave(post);
    setEditingPost(undefined);
    setActiveTab('posts');
  };

  const handleDelete = async (slug: string) => {
    if (!confirm('确定要删除这篇文章吗？')) return;

    const githubService = getGitHubService();
    if (!githubService) return;

    try {
      await githubService.deletePost(slug);
      toast.success('文章已删除');
      loadPosts();
      // 从选择列表中移除已删除的文章
      setSelectedPosts(prev => prev.filter(selectedSlug => selectedSlug !== slug));
    } catch (error: any) {
      toast.error(error.message || '删除失败');
    }
  };

  // 处理选择/取消选择文章
  const handleSelectPost = (slug: string) => {
    setSelectedPosts(prev => {
      if (prev.includes(slug)) {
        return prev.filter(selectedSlug => selectedSlug !== slug);
      } else {
        return [...prev, slug];
      }
    });
  };

  // 处理全选/取消全选
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedPosts([]);
      setSelectAll(false);
    } else {
      setSelectedPosts(posts.map(post => post.slug));
      setSelectAll(true);
    }
  };

  // 处理批量删除
  const handleBatchDelete = async () => {
    if (selectedPosts.length === 0) return;
    
    if (!confirm(`确定要删除这 ${selectedPosts.length} 篇文章吗？`)) return;

    const githubService = getGitHubService();
    if (!githubService) return;

    try {
      await githubService.deletePosts(selectedPosts);
      toast.success(`成功删除 ${selectedPosts.length} 篇文章`);
      loadPosts();
      setSelectedPosts([]);
      setSelectAll(false);
    } catch (error: any) {
      toast.error(error.message || '批量删除失败');
    }
  };

  // 分类管理方法
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('分类名称不能为空');
      return;
    }

    const categoryService = getCategoryService();
    try {
      await categoryService.createCategory(newCategoryName);
      toast.success('分类创建成功');
      setNewCategoryName('');
      // 重新加载分类列表
      await categoryService.loadCategories();
      const categoriesList = categoryService.getAllCategories();
      setCategories(categoriesList);
    } catch (error: any) {
      toast.error(error.message || '创建分类失败');
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setEditingCategoryName(category.label);
  };

  const handleSaveCategory = async () => {
    if (!editingCategory || !editingCategoryName.trim()) {
      toast.error('分类名称不能为空');
      return;
    }

    const categoryService = getCategoryService();
    try {
      await categoryService.updateCategory(editingCategory.id, editingCategoryName);
      toast.success('分类更新成功');
      setEditingCategory(null);
      setEditingCategoryName('');
      // 重新加载分类列表
      await categoryService.loadCategories();
      const categoriesList = categoryService.getAllCategories();
      setCategories(categoriesList);
    } catch (error: any) {
      toast.error(error.message || '更新分类失败');
    }
  };

  const handleCancelEditCategory = () => {
    setEditingCategory(null);
    setEditingCategoryName('');
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('确定要删除这个分类吗？')) return;

    const categoryService = getCategoryService();
    try {
      await categoryService.deleteCategory(id);
      toast.success('分类删除成功');
      // 重新加载分类列表
      await categoryService.loadCategories();
      const categoriesList = categoryService.getAllCategories();
      setCategories(categoriesList);
      // 从选择列表中移除已删除的分类
      setSelectedCategories(prev => prev.filter(selectedId => selectedId !== id));
    } catch (error: any) {
      toast.error(error.message || '删除分类失败');
    }
  };

  // 处理选择/取消选择分类
  const handleSelectCategory = (id: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(id)) {
        return prev.filter(selectedId => selectedId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // 处理全选/取消全选分类
  const handleSelectAllCategories = () => {
    if (selectAllCategories) {
      setSelectedCategories([]);
      setSelectAllCategories(false);
    } else {
      setSelectedCategories(categories.map(category => category.id));
      setSelectAllCategories(true);
    }
  };

  // 处理批量删除分类
  const handleBatchDeleteCategory = async () => {
    if (selectedCategories.length === 0) return;
    
    if (!confirm(`确定要删除这 ${selectedCategories.length} 个分类吗？`)) return;

    const categoryService = getCategoryService();
    try {
      await categoryService.deleteCategories(selectedCategories);
      toast.success(`成功删除 ${selectedCategories.length} 个分类`);
      // 重新加载分类列表
      await categoryService.loadCategories();
      const categoriesList = categoryService.getAllCategories();
      setCategories(categoriesList);
      setSelectedCategories([]);
      setSelectAllCategories(false);
    } catch (error: any) {
      toast.error(error.message || '批量删除分类失败');
    }
  };

  // 未登录状态
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[var(--color-primary-500)] rounded-full mb-4">
              <Github className="w-8 h-8 text-black" />
            </div>
            <h1 className="text-2xl font-medium text-black dark:text-white mb-2">
              管理员登录
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              使用 GitHub Personal Access Token 登录
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="token">Personal Access Token</Label>
              <div className="relative">
                <Input
                  id="token"
                  type={showToken ? 'text' : 'password'}
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxx"
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                需要 repo 权限的 Personal Access Token
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="owner">仓库所有者</Label>
              <Input
                id="owner"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                placeholder="username"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="repo">仓库名称</Label>
              <Input
                id="repo"
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
                placeholder="blog-repo"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="path">文章存放路径</Label>
              <Input
                id="path"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                placeholder="posts/"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--color-primary-500)] text-black hover:bg-[var(--color-primary-600)]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  登录中...
                </>
              ) : (
                '登录'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <a
              href="https://github.com/settings/tokens"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[var(--color-primary-500)] hover:underline"
            >
              如何获取 Personal Access Token？
            </a>
          </div>
        </motion.div>
      </div>
    );
  }

  // 已登录状态
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="section-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-2xl font-medium text-black dark:text-white">
              管理后台
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              欢迎回来，{user?.name || '用户'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditingPost(undefined);
                setActiveTab('editor');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'editor'
                  ? 'bg-[var(--color-primary-500)] text-black'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              <Plus className="w-4 h-4" />
              新建文章
            </button>
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'posts'
                  ? 'bg-[var(--color-primary-500)] text-black'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              <FileText className="w-4 h-4" />
              文章列表
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'categories'
                  ? 'bg-[var(--color-primary-500)] text-black'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              <FileText className="w-4 h-4" />
              分类管理
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              退出
            </button>
          </div>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'editor' && (
            <motion.div
              key="editor"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <MarkdownEditor
                initialPost={editingPost}
                onSave={handleSave}
                onPublish={handlePublish}
              />
            </motion.div>
          )}

          {activeTab === 'posts' && (
            <motion.div
              key="posts"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {posts.length === 0 ? (
                <div className="text-center py-20">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">暂无文章</p>
                  <button
                    onClick={() => setActiveTab('editor')}
                    className="mt-4 text-[var(--color-primary-500)] hover:underline"
                  >
                    创建第一篇文章
                  </button>
                </div>
              ) : (
                <>
                  {/* 批量操作栏 */}
                  {selectedPosts.length > 0 && (
                    <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        已选择 {selectedPosts.length} 篇文章
                      </span>
                      <button
                        onClick={handleBatchDelete}
                        className="px-4 py-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
                      >
                        批量删除
                      </button>
                    </div>
                  )}
                  
                  {/* 全选复选框 */}
                  <div className="mb-2 flex items-center">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)]"
                    />
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                      全选
                    </span>
                  </div>
                  
                  {/* 文章列表 */}
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <motion.div
                        key={post.slug}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedPosts.includes(post.slug)}
                            onChange={() => handleSelectPost(post.slug)}
                            className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)]"
                          />
                          <div>
                            <h3 className="font-medium text-black dark:text-white">{post.title}</h3>
                            <p className="text-sm text-gray-500">
                              {new Date(post.date).toLocaleDateString()} · {post.category}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingPost(post);
                              setActiveTab('editor');
                            }}
                            className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                          >
                            编辑
                          </button>
                          <button
                            onClick={() => handleDelete(post.slug)}
                            className="px-3 py-1.5 text-sm bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
                          >
                            删除
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          )}

          {activeTab === 'categories' && (
            <motion.div
              key="categories"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* 创建分类 */}
              <div className="mb-8 p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl">
                <h2 className="text-xl font-medium text-black dark:text-white mb-4">创建分类</h2>
                <div className="flex gap-3">
                  <Input
                    placeholder="输入分类名称"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleCreateCategory}
                    className="bg-[var(--color-primary-500)] text-black hover:bg-[var(--color-primary-600)]"
                  >
                    创建
                  </Button>
                </div>
              </div>

              {/* 分类列表 */}
              <div>
                <h2 className="text-xl font-medium text-black dark:text-white mb-4">分类列表</h2>
                {categories.length === 0 ? (
                  <div className="text-center py-20">
                    <p className="text-gray-500">暂无分类</p>
                  </div>
                ) : (
                  <>
                    {/* 批量操作栏 */}
                    {selectedCategories.length > 0 && (
                      <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          已选择 {selectedCategories.length} 个分类
                        </span>
                        <button
                          onClick={handleBatchDeleteCategory}
                          className="px-4 py-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
                        >
                          批量删除
                        </button>
                      </div>
                    )}
                    
                    {/* 全选复选框 */}
                    <div className="mb-2 flex items-center">
                      <input
                        type="checkbox"
                        checked={selectAllCategories}
                        onChange={handleSelectAllCategories}
                        className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)]"
                      />
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                        全选
                      </span>
                    </div>
                    
                    {/* 分类列表 */}
                    <div className="space-y-4">
                      {categories.map((category) => (
                        <motion.div
                          key={category.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl"
                        >
                          {editingCategory?.id === category.id ? (
                            <div className="flex items-center gap-3">
                              <Input
                                value={editingCategoryName}
                                onChange={(e) => setEditingCategoryName(e.target.value)}
                                className="flex-1"
                              />
                              <button
                                onClick={handleSaveCategory}
                                className="p-2 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg"
                              >
                                <Save className="w-5 h-5" />
                              </button>
                              <button
                                onClick={handleCancelEditCategory}
                                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={selectedCategories.includes(category.id)}
                                  onChange={() => handleSelectCategory(category.id)}
                                  className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)]"
                                />
                                <div>
                                  <h3 className="font-medium text-black dark:text-white">{category.label}</h3>
                                  <p className="text-sm text-gray-500">ID: {category.id}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleEditCategory(category)}
                                  className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg"
                                >
                                  <Edit className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteCategory(category.id)}
                                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
