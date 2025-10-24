-- 文件: 009_finalize_setup.sql
-- 最终设置：在所有其他表和函数都创建完毕后，安全地更新 handle_new_user 函数

-- 1. 更新用户注册处理函数，以支持动态积分配置和备注信息
--    此时，add_points_log 和 get_function_points 函数均已存在
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  user_name TEXT;
  user_notes TEXT;
  user_points DECIMAL(10,2);
  registration_points DECIMAL(10,2);
BEGIN
  -- 从raw_user_meta_data中获取用户名
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'username',
    split_part(NEW.email, '@', 1)
  );

  -- 从raw_user_meta_data中获取备注信息（如果有的话）
  user_notes := NEW.raw_user_meta_data->>'notes';
  
  -- 从raw_user_meta_data中获取初始积分（如果有的话）
  user_points := COALESCE((NEW.raw_user_meta_data->>'points')::DECIMAL(10,2), 0);

  -- 插入用户资料，包含备注信息
  INSERT INTO public."user-management" (id, username, avatar, points, 备注)
  VALUES (
    NEW.id,
    user_name,
    public.get_random_avatar(),
    user_points,
    user_notes
  );

  -- 从 app_config 动态获取"新用户注册"的积分配置
  SELECT public.get_function_points('新用户注册') INTO registration_points;

  -- 如果配置了注册奖励积分，则调用唯一的积分处理函数
  IF COALESCE(registration_points, 0) > 0 THEN
    PERFORM public.add_points_log(
      NEW.id,
      registration_points,
      'feature_usage',
      '新用户注册奖励',
      NULL,
      NULL,
      NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$;

-- 2. 注意：触发器已在 001_create_user_system.sql 中创建
--    由于 handle_new_user 函数已更新，触发器会自动使用最新版本的函数
--    无需手动刷新触发器