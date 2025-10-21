-- 创建用户头像存储桶
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatar',
  'avatar',
  true,
  5242880, -- 5MB
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
);

-- 设置avatar存储桶的RLS策略
-- 任何人都可以查看头像
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'avatar');

-- 用户只能上传到自己的文件夹
CREATE POLICY "Users can upload their own avatar" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatar' 
  AND (storage.foldername(name))[1] = (select auth.uid())::text
);

-- 用户只能更新自己的头像
CREATE POLICY "Users can update their own avatar" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatar' 
  AND (storage.foldername(name))[1] = (select auth.uid())::text
);

-- 用户只能删除自己的头像
CREATE POLICY "Users can delete their own avatar" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatar' 
  AND (storage.foldername(name))[1] = (select auth.uid())::text
);