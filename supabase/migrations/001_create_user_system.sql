-- 用户系统设置脚本
-- 1. 创建存储桶用于默认头像
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'default-avatar',
  'default-avatar',
  true,
  5242880, -- 5MB
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
);

-- 2. 设置存储桶的RLS策略
CREATE POLICY "Default avatar images are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'default-avatar');

CREATE POLICY "Anyone can upload a default avatar" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'default-avatar');

CREATE POLICY "Anyone can update default avatars" ON storage.objects
FOR UPDATE USING (bucket_id = 'default-avatar');

-- 创建用户管理表
CREATE TABLE public."user-management" (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  points INTEGER NOT NULL DEFAULT 0,
  avatar TEXT,
  备注 TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 启用RLS
ALTER TABLE public."user-management" ENABLE ROW LEVEL SECURITY;

-- 5. 创建RLS策略
-- 用户可以查看所有资料（用于显示用户名等公开信息）
CREATE POLICY "Profiles are viewable by everyone" ON public."user-management"
FOR SELECT USING (true);

-- 用户只能更新自己的资料
CREATE POLICY "Users can update own profile" ON public."user-management"
FOR UPDATE USING (auth.uid() = id);

-- 管理员可以更新任何用户的资料
CREATE POLICY "Admins can update any profile" ON public."user-management"
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public."user-management" 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 6. 创建随机头像选择函数
CREATE OR REPLACE FUNCTION public.get_random_avatar()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  avatar_files TEXT[];
  random_file TEXT;
BEGIN
  -- 动态查询default-avatar存储桶中的所有文件
  SELECT ARRAY(
    SELECT name 
    FROM storage.objects 
    WHERE bucket_id = 'default-avatar' 
    AND name IS NOT NULL
  ) INTO avatar_files;
  
  -- 如果存储桶中没有文件，返回null
  IF array_length(avatar_files, 1) IS NULL OR array_length(avatar_files, 1) = 0 THEN
    RETURN NULL;
  END IF;
  
  -- 随机选择一个文件
  SELECT avatar_files[floor(random() * array_length(avatar_files, 1) + 1)] INTO random_file;
  
  RETURN random_file;
END;
$$;

-- 7. 创建新用户处理函数（已修正为正确版本）
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  user_name TEXT;
BEGIN
  -- 从raw_user_meta_data中获取用户名
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'username',
    split_part(NEW.email, '@', 1)
  );

  -- 插入用户资料，初始积分为 0
  INSERT INTO public."user-management" (id, username, avatar, points)
  VALUES (
    NEW.id,
    user_name,
    public.get_random_avatar(),
    0
  );

  RETURN NEW;
END;
$$;

-- 8. 创建触发器
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 更新时间戳函数
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 10. 创建更新时间戳触发器
CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON public."user-management"
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- 11. 创建辅助函数
-- 检查是否为管理员
CREATE OR REPLACE FUNCTION is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public."user-management" 
    WHERE id = user_id AND role = 'admin'
  );
END;
$$;

-- ★【删除】不再需要这个函数，它会绕过日志系统，不安全
-- DROP FUNCTION IF EXISTS public.add_points(UUID, INTEGER);

-- 获取用户资料
CREATE OR REPLACE FUNCTION get_user_profile(user_id UUID DEFAULT auth.uid())
RETURNS TABLE (
  id UUID,
  username TEXT,
  role TEXT,
  points INTEGER,
  avatar TEXT,
  备注 TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.username, p.role, p.points, p.avatar, p.备注, p.created_at, p.updated_at
  FROM public."user-management" p
  WHERE p.id = user_id;
END;
$$;