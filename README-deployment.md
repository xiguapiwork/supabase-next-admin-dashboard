# 部署指南

## 🚀 部署到 Vercel

### 1. 准备 Supabase 项目

1. 在 [Supabase](https://supabase.com) 创建新项目
2. 等待项目初始化完成
3. 获取项目配置信息：
   - 项目 URL: `https://your-project-ref.supabase.co`
   - 公开密钥: 在 Settings > API 中找到 `anon public` 密钥

### 2. 应用数据库迁移

在 Supabase 项目中执行以下步骤：

1. 进入 SQL Editor
2. 复制并执行 `supabase/migrations/001_create_user_system.sql` 中的所有内容
3. 确保所有表、函数和触发器都创建成功

### 3. 上传头像图片

1. 进入 Storage 管理页面
2. 确认 `avatars` 存储桶已创建
3. 手动上传 `default-avatar` 文件夹中的7张图片，重命名为：
   - `orange.png` (橙子.png)
   - `apple.png` (苹果.png)
   - `strawberry.png` (草莓.png)
   - `pineapple.png` (菠萝.png)
   - `blueberry.png` (蓝莓.png)
   - `watermelon.png` (西瓜.png)
   - `pear.png` (鸭梨.png)

### 4. 配置 Vercel 环境变量

在 Vercel 项目设置中添加以下环境变量：

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_production_publishable_key
```

### 5. 部署

1. 连接 GitHub 仓库到 Vercel
2. 部署项目
3. 测试用户注册功能

## 🔧 本地开发

1. 复制 `.env.example` 为 `.env.local`
2. 启动 Supabase: `npx supabase start`
3. 应用迁移: `npx supabase db reset --local`
4. 启动开发服务器: `npm run dev`

## 📋 功能清单

- ✅ 用户注册时自动创建用户资料
- ✅ 随机分配默认头像
- ✅ 用户名存储在 `profiles` 表和 `raw_user_meta_data` 中
- ✅ 积分系统（默认0分）
- ✅ 角色系统（默认'user'，支持'admin'）
- ✅ 行级安全策略 (RLS)
- ✅ 自动更新时间戳

## 🗄️ 数据库结构

### `public.profiles` 表
- `id`: UUID (主键，关联 auth.users)
- `username`: TEXT (唯一，非空)
- `role`: TEXT (默认 'user')
- `points`: INTEGER (默认 0)
- `avatar`: TEXT (头像文件名)
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

### 存储桶
- `avatars`: 公共存储桶，存储用户头像图片

### 辅助函数
- `get_random_avatar()`: 随机选择默认头像
- `handle_new_user()`: 新用户注册触发器
- `is_admin()`: 检查用户是否为管理员
- `add_points()`: 添加用户积分
- `get_user_profile()`: 获取用户资料