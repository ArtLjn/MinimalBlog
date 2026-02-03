// GitHub 相关类型
export interface GitHubConfig {
  owner: string;
  repo: string;
  path: string;
  token: string;
}

export interface GitHubUser {
  login: string;
  avatar_url: string;
  name: string;
  email: string;
}

// 博客文章类型
export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  date: string;
  readTime: string;
  content: string;
  coverImage?: string;
  author?: string;
}

// Front matter 类型
export interface PostFrontMatter {
  title: string;
  description: string;
  category: string;
  tags: string[];
  date: string;
  coverImage?: string;
  author?: string;
}

// 认证状态类型
export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: GitHubUser | null;
  loading: boolean;
  error: string | null;
}

// 主题类型
export type Theme = 'light' | 'dark' | 'system';

// 动画变体类型
export interface AnimationVariants {
  hidden: object;
  visible: object;
  exit?: object;
}

// 导航链接类型
export interface NavLink {
  label: string;
  href: string;
}

// 分类类型
export type BlogCategory = string;

export interface Category {
  id: BlogCategory;
  label: string;
  createdAt: string;
  updatedAt: string;
}
