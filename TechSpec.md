# 博客系统技术规格文档

## 项目架构

### 技术栈
- **框架**: React 18 + TypeScript + Vite
- **样式**: Tailwind CSS 3.4
- **UI组件**: shadcn/ui
- **动画**: Framer Motion + GSAP
- **Markdown**: react-markdown + remark-gfm
- **GitHub API**: Octokit.js
- **状态管理**: React Context + useState/useReducer
- **路由**: React Router DOM

### 文件结构

```
/mnt/okcomputer/output/app/
├── public/
│   └── fonts/              # 自定义字体文件
├── src/
│   ├── components/         # 可复用组件
│   │   ├── ui/            # shadcn/ui 组件
│   │   ├── layout/        # 布局组件
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Container.tsx
│   │   ├── blog/          # 博客相关组件
│   │   │   ├── BlogCard.tsx
│   │   │   ├── BlogGrid.tsx
│   │   │   ├── BlogTabs.tsx
│   │   │   └── MarkdownRenderer.tsx
│   │   └── common/        # 通用组件
│   │       ├── AnimatedText.tsx
│   │       ├── GlassCard.tsx
│   │       └── GradientBackground.tsx
│   ├── sections/          # 页面区块
│   │   ├── Hero.tsx
│   │   ├── BlogSection.tsx
│   │   ├── CTASection.tsx
│   │   └── AdminSection.tsx
│   ├── pages/             # 页面组件
│   │   ├── Home.tsx
│   │   ├── BlogPost.tsx
│   │   ├── Admin.tsx
│   │   └── About.tsx
│   ├── hooks/             # 自定义 Hooks
│   │   ├── useGitHub.ts
│   │   ├── useScrollAnimation.ts
│   │   └── useLocalStorage.ts
│   ├── services/          # 服务层
│   │   └── github.ts      # GitHub API 封装
│   ├── context/           # React Context
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   ├── types/             # TypeScript 类型
│   │   └── index.ts
│   ├── utils/             # 工具函数
│   │   └── helpers.ts
│   ├── styles/            # 全局样式
│   │   └── globals.css
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── tailwind.config.js
├── vite.config.ts
└── package.json
```

## 核心模块设计

### 1. GitHub API 服务层 (services/github.ts)

```typescript
// 核心功能：
// - 初始化 Octokit 客户端
// - 验证 PAT (Personal Access Token)
// - 获取仓库文件列表
// - 读取 Markdown 文件内容
// - 创建/更新 Markdown 文件
// - 删除文件

interface GitHubConfig {
  owner: string;
  repo: string;
  path: string;  // 文章存放路径，如 'posts/'
  token: string;
}

interface BlogPost {
  slug: string;
  title: string;
  description: string;
  category: string;
  date: string;
  readTime: string;
  content: string;
  coverImage?: string;
}

// 核心方法：
// - authenticate(token: string): Promise<boolean>
// - getPosts(): Promise<BlogPost[]>
// - getPost(slug: string): Promise<BlogPost>
// - createPost(post: BlogPost): Promise<void>
// - updatePost(post: BlogPost): Promise<void>
// - deletePost(slug: string): Promise<void>
```

### 2. 认证上下文 (context/AuthContext.tsx)

```typescript
interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: GitHubUser | null;
  loading: boolean;
  error: string | null;
}

// 功能：
// - 存储 PAT 到 localStorage
// - 验证 token 有效性
// - 提供登录/注销方法
// - 全局认证状态管理
```

### 3. Markdown 编辑器组件

```typescript
// 使用 react-markdown + react-textarea-autosize
// 功能：
// - 双栏布局：编辑区 + 预览区
// - Front-matter 编辑（标题、分类、标签等）
// - 实时预览
// - 工具栏（粗体、斜体、链接、图片、代码块等）
// - 自动保存草稿到 localStorage
```

## 组件清单

### shadcn/ui 组件（已预装）
- Button
- Card
- Input
- Textarea
- Dialog
- Tabs
- Badge
- Separator
- Skeleton
- Toast
- DropdownMenu

### 自定义组件

| 组件名 | 用途 | 复杂度 |
|--------|------|--------|
| AnimatedText | 文字逐字/逐词动画 | 高 |
| GlassCard | 毛玻璃效果卡片 | 中 |
| GradientBackground | 动态渐变背景 | 中 |
| BlogCard | 博客文章卡片 | 中 |
| BlogTabs | 分类标签切换 | 中 |
| MarkdownRenderer | Markdown 渲染器 | 高 |
| MarkdownEditor | Markdown 编辑器 | 高 |
| LoginForm | PAT 登录表单 | 低 |
| PostForm | 文章编辑表单 | 高 |

## 动画实现计划

| 动画 | 库 | 实现方式 | 复杂度 |
|------|-----|----------|--------|
| 页面入场动画 | Framer Motion | AnimatePresence + motion.div | 中 |
| 文字拆分动画 | Framer Motion | variants + staggerChildren | 高 |
| 滚动视差 | GSAP ScrollTrigger | scrub + pin | 高 |
| 卡片悬停效果 | Framer Motion | whileHover + whileTap | 低 |
| 标签切换动画 | Framer Motion | layoutId + AnimatePresence | 中 |
| 导航栏滚动效果 | Framer Motion | useScroll + useTransform | 中 |
| 渐变背景动画 | CSS | @keyframes + background-position | 低 |
| 毛玻璃效果 | CSS | backdrop-filter + background | 低 |

## 路由设计

```typescript
// 路由结构：
// /           -> 首页 (Home)
// /post/:slug -> 文章详情页 (BlogPost)
// /admin      -> 后台管理 (Admin) - 需要登录
// /about      -> 关于页面 (About)

// 路由守卫：
// - /admin 需要认证
// - 未认证重定向到 /admin/login
```

## 状态管理

### 本地状态 (useState)
- 表单输入
- UI 开关（菜单、弹窗等）
- 加载状态

### 全局状态 (Context)
- 认证状态 (AuthContext)
- 主题状态 (ThemeContext)
- 文章列表缓存

### 持久化 (localStorage)
- PAT Token
- 草稿文章
- 主题偏好

## 依赖列表

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "framer-motion": "^10.16.0",
    "gsap": "^3.12.0",
    "@gsap/react": "^2.0.0",
    "octokit": "^3.1.0",
    "react-markdown": "^9.0.0",
    "remark-gfm": "^4.0.0",
    "rehype-highlight": "^7.0.0",
    "react-textarea-autosize": "^8.5.0",
    "date-fns": "^2.30.0",
    "lucide-react": "^0.294.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  }
}
```

## 性能优化策略

1. **代码分割**
   - 路由级别懒加载
   - 编辑器组件动态导入

2. **图片优化**
   - 使用 WebP 格式
   - 懒加载
   - 响应式图片

3. **动画优化**
   - 仅使用 transform 和 opacity
   - will-change 策略性使用
   - 减少动效支持

4. **数据缓存**
   - 文章列表缓存
   - GitHub API 响应缓存

## 安全考虑

1. **PAT 存储**
   - 仅存储在 localStorage
   - 不在代码中硬编码
   - 提供清除功能

2. **API 调用**
   - 仅在客户端调用 GitHub API
   - 不暴露敏感信息

3. **内容安全**
   - Markdown 渲染使用 DOMPurify
   - 防止 XSS 攻击
