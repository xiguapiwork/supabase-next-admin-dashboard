<div align="center">
  <h1>📊 Supabase Next Admin Dashboard</h1>
  <p>基于 Next.js 和 Supabase 的智能用户管理平台</p>
</div>

<p align="center">
  <a href="#特性"><strong>特性</strong></a> ·
  <a href="#在线演示"><strong>在线演示</strong></a> ·
  <a href="#部署到-vercel"><strong>部署到 Vercel</strong></a> ·
  <a href="#本地运行"><strong>本地运行</strong></a> ·
  <a href="#项目结构"><strong>项目结构</strong></a> ·
  <a href="#反馈和问题"><strong>反馈和问题</strong></a>
</p>
<br/>

## 特性

### 🔐 用户认证与管理
- 基于 [Supabase Auth](https://supabase.com/auth) 的完整用户认证系统
- 支持邮箱密码登录、注册和密码重置
- 用户资料管理（头像、用户名、密码修改）
- 安全的会话管理，支持 SSR 和客户端

### 👑 管理员功能
- 管理员专用控制面板
- 用户管理和权限控制
- 系统设置和配置管理
- 数据清理和维护工具

### 🎯 积分系统
- 用户积分显示和管理
- 积分历史记录追踪
- 可扩展的积分规则系统

### 🎨 现代化 UI/UX
- 基于 [Tailwind CSS](https://tailwindcss.com) 的响应式设计
- 使用 [shadcn/ui](https://ui.shadcn.com/) 组件库
- 支持深色/浅色主题切换
- 移动端友好的界面设计

### ⚡ 技术栈
- **前端框架**: [Next.js 15](https://nextjs.org) (App Router)
- **数据库**: [Supabase](https://supabase.com) (PostgreSQL + 实时订阅)
- **认证**: Supabase Auth with SSR
- **样式**: Tailwind CSS + shadcn/ui
- **状态管理**: TanStack Query
- **表单处理**: React Hook Form + Zod 验证
- **类型安全**: TypeScript

## 在线演示

> 🚧 演示站点正在建设中，敬请期待！

## 部署到 Vercel

Vercel 部署将引导您创建 Supabase 账户和项目。

安装 Supabase 集成后，所有相关的环境变量将自动分配给项目，使部署完全正常运行。

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-username%2Fsupabase-next-admin-dashboard&project-name=supabase-next-admin-dashboard&repository-name=supabase-next-admin-dashboard)

## 本地运行

### 前置要求

1. 首先需要一个 Supabase 项目，可以通过 [Supabase 控制台](https://database.new) 创建

2. 克隆项目到本地

   ```bash
   git clone https://github.com/your-username/supabase-next-admin-dashboard.git
   cd supabase-next-admin-dashboard
   ```

3. 安装依赖

   ```bash
   npm install
   # 或者
   yarn install
   # 或者
   pnpm install
   ```

4. 配置环境变量

   将 `.env.example` 重命名为 `.env.local` 并更新以下配置：

   ```env
   NEXT_PUBLIC_SUPABASE_URL=[您的 SUPABASE 项目 URL]
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=[您的 SUPABASE 项目 API 公钥]
   SUPABASE_SECRET_KEY=[您的 SUPABASE 项目密钥]
   
   # 可选：S3 存储配置（用于文件上传）
   SUPABASE_S3_ACCESS_KEY_ID=[S3 访问密钥 ID]
   SUPABASE_S3_SECRET_ACCESS_KEY=[S3 密钥]
   SUPABASE_S3_REGION=[S3 区域]
   SUPABASE_S3_BUCKET=[S3 存储桶名称]
   ```

   > 💡 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` 可以在 [Supabase 项目的 API 设置](https://supabase.com/dashboard/project/_?showConnect=true) 中找到

5. 运行开发服务器

   ```bash
   npm run dev
   ```

   项目现在应该在 [localhost:3000](http://localhost:3000/) 上运行。

### 数据库设置

项目需要以下数据库表结构（可以通过 Supabase SQL 编辑器创建）：

```sql
-- 用户资料表
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  username TEXT UNIQUE,
  avatar_url TEXT,
  credits INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (id)
);

-- 启用行级安全策略
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 创建策略
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
 CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
 ```

## 项目结构

```
supabase-next-admin-dashboard/
├── app/                          # Next.js App Router 页面
│   ├── auth/                     # 认证相关页面
│   │   ├── login/               # 登录页面
│   │   └── signup/              # 注册页面
│   ├── protected/               # 需要认证的页面
│   │   ├── admin/               # 管理员页面
│   │   └── settings/            # 用户设置页面
│   ├── globals.css              # 全局样式
│   ├── layout.tsx               # 根布局组件
│   └── page.tsx                 # 首页
├── components/                   # React 组件
│   ├── ui/                      # shadcn/ui 基础组件
│   ├── admin-layout.tsx         # 管理员布局组件
│   ├── header.tsx               # 导航栏组件
│   ├── user-dropdown.tsx        # 用户下拉菜单
│   ├── theme-switcher.tsx       # 主题切换器
│   └── ...                      # 其他业务组件
├── lib/                         # 工具库和配置
│   ├── supabase/               # Supabase 客户端配置
│   │   ├── client.ts           # 浏览器端客户端
│   │   ├── server.ts           # 服务端客户端
│   │   └── middleware.ts       # 中间件配置
│   ├── utils.ts                # 通用工具函数
│   └── avatar-utils.ts         # 头像处理工具
├── contexts/                    # React Context
│   └── AppSettingsContext.tsx  # 应用设置上下文
├── hooks/                       # 自定义 React Hooks
├── middleware.ts                # Next.js 中间件
├── next.config.ts              # Next.js 配置
├── tailwind.config.ts          # Tailwind CSS 配置
└── package.json                # 项目依赖配置
```

### 核心目录说明

- **`app/`**: 使用 Next.js 13+ App Router 的页面结构
- **`components/`**: 可复用的 React 组件，包含 UI 组件和业务组件
- **`lib/`**: 工具函数、配置文件和第三方服务集成
- **`contexts/`**: React Context 提供者，用于全局状态管理
- **`hooks/`**: 自定义 React Hooks，封装复用逻辑
- **`middleware.ts`**: Next.js 中间件，处理认证和路由保护

## 部署选项

### Vercel 部署（推荐）

1. Fork 本项目到您的 GitHub
2. 在 [Vercel](https://vercel.com) 中导入项目
3. 配置环境变量
4. 部署完成

### Deno Deploy

项目已优化支持 Deno Deploy：

1. 确保 Next.js 版本为 15.5.6+
2. 推送代码到 GitHub
3. 在 [Deno Deploy](https://deno.com/deploy) 中连接 GitHub 仓库
4. 配置环境变量
5. 部署完成

### 其他平台

项目也支持部署到：
- Netlify
- Railway
- Render
- 任何支持 Node.js 的平台

## 反馈和问题

如有问题或建议，请在 [GitHub Issues](https://github.com/your-username/supabase-next-admin-dashboard/issues) 中提交。

## 更多资源

- [Next.js 文档](https://nextjs.org/docs)
- [Supabase 文档](https://supabase.com/docs)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [shadcn/ui 文档](https://ui.shadcn.com/docs)
