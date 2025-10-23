# Supabase Next Admin Dashboard

一个基于 Next.js 15 和 Supabase 构建的现代化全栈管理后台系统，提供完整的用户管理、积分系统、兑换卡管理等功能。

## ✨ 功能特性

### 🔐 用户认证系统
- 用户注册、登录、密码重置
- 基于 Supabase Auth 的安全认证
- 角色权限管理（普通用户、付费用户、管理员）
- 用户资料管理和头像上传

### 📊 管理后台
- **数据看板 (Dashboard)**: 实时数据统计和可视化图表
- **用户管理**: 用户信息管理、积分调整、角色分配
- **兑换卡管理**: 兑换卡创建、状态管理、批量操作
- **积分日志**: 积分变动记录和详细追踪
- **任务日志**: 系统任务执行记录和状态监控
- **系统设置**: 应用配置和管理员设置

### 💰 积分系统
- 积分获取、消费和管理
- 兑换卡积分充值
- 积分使用历史记录
- 实时积分统计和分析

### 🎨 现代化 UI
- 基于 Tailwind CSS 的响应式设计
- 支持深色/浅色主题切换
- 使用 Radix UI 组件库
- 优雅的动画和交互效果

### 🌐 国际化支持
- 中英文双语支持
- 基于 next-intl 的国际化方案
- 动态语言切换

## 🛠️ 技术栈

### 前端
- **Next.js 15** - React 全栈框架
- **React 19** - 用户界面库
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式框架
- **Radix UI** - 无障碍组件库
- **Recharts** - 数据可视化
- **React Query** - 数据状态管理
- **React Hook Form** - 表单处理

### 后端
- **Supabase** - 后端即服务平台
  - PostgreSQL 数据库
  - 实时订阅
  - 用户认证
  - 文件存储
  - Edge Functions

### 开发工具
- **ESLint** - 代码规范
- **PostCSS** - CSS 处理
- **Autoprefixer** - CSS 兼容性

## 📁 项目结构

```
├── app/                    # Next.js App Router
│   ├── admin/             # 管理员页面
│   ├── auth/              # 认证相关页面
│   ├── protected/         # 受保护的页面
│   └── api/               # API 路由
├── components/            # React 组件
│   ├── ui/               # 基础 UI 组件
│   ├── admin-*.tsx       # 管理后台组件
│   ├── dashboard.tsx     # 数据看板
│   ├── users-management.tsx  # 用户管理
│   ├── exchange-cards.tsx    # 兑换卡管理
│   ├── points-logs.tsx       # 积分日志
│   └── task-logs.tsx         # 任务日志
├── hooks/                 # 自定义 React Hooks
├── lib/                   # 工具函数和配置
│   ├── supabase/         # Supabase 客户端配置
│   ├── schemas/          # 数据验证模式
│   └── utils.ts          # 通用工具函数
├── contexts/              # React Context
├── messages/              # 国际化文件
├── supabase/             # Supabase 配置和迁移
│   ├── config.toml       # Supabase 本地配置
│   └── migrations/       # 数据库迁移文件
└── public/               # 静态资源
```

## 🚀 快速开始

### 环境要求
- Node.js 18.17 或更高版本
- npm 或 yarn 包管理器
- Supabase 账户

### 1. 克隆项目
```bash
git clone <repository-url>
cd supabase-next-admin-dashboard
```

### 2. 安装依赖
```bash
npm install
# 或
yarn install
```

### 3. 环境配置
复制环境变量模板并配置：
```bash
cp .env.example .env.local
```

编辑 `.env.local` 文件，填入你的 Supabase 配置：
```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
SUPABASE_MANAGEMENT_API_TOKEN=your_supabase_management_api_token
```

### 4. 数据库设置
如果使用本地开发环境：
```bash
# 启动本地 Supabase
supabase start

# 运行数据库迁移
supabase db reset
```

### 5. 启动开发服务器
```bash
npm run dev
# 或
yarn dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 📊 数据库结构

### 主要数据表
- **user-management**: 用户管理表，存储用户信息和角色
- **exchange-cards**: 兑换卡管理表
- **points_log**: 积分变动记录表
- **task_logs**: 任务执行日志表

### 权限设置
项目使用 Supabase 的行级安全策略 (RLS) 来确保数据安全：
- 用户只能访问自己的数据
- 管理员可以访问所有数据
- 不同角色有不同的操作权限

## 🔧 开发指南

### 添加新功能
1. 在 `components/` 目录下创建新组件
2. 在 `hooks/` 目录下添加数据获取逻辑
3. 在 `app/` 目录下添加新页面路由
4. 更新导航配置

### 数据库操作
- 使用 `lib/supabase/client.ts` 进行客户端数据库操作
- 使用 `lib/supabase/server.ts` 进行服务端数据库操作
- 所有数据库查询都通过 React Query 进行缓存管理

### 样式开发
- 使用 Tailwind CSS 类名进行样式设计
- 遵循现有的设计系统和组件规范
- 支持深色模式，使用相应的 CSS 变量

## 📱 部署

### Vercel 部署
1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量
4. 部署完成

### 环境变量配置
生产环境需要配置以下环境变量：
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_production_anon_key
SUPABASE_MANAGEMENT_API_TOKEN=your_production_service_role_key
```

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🆘 支持

如果你在使用过程中遇到问题：

1. 查看 [Issues](../../issues) 页面寻找解决方案
2. 创建新的 Issue 描述你的问题
3. 参考 [Supabase 文档](https://supabase.com/docs)
4. 参考 [Next.js 文档](https://nextjs.org/docs)

## 🙏 致谢

- [Supabase](https://supabase.com/) - 提供强大的后端服务
- [Next.js](https://nextjs.org/) - 优秀的 React 框架
- [Tailwind CSS](https://tailwindcss.com/) - 实用的 CSS 框架
- [Radix UI](https://www.radix-ui.com/) - 无障碍组件库
