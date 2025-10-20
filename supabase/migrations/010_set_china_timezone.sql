-- 设置数据库时区为中国时间 (Asia/Shanghai)
-- 这个迁移文件将数据库默认时区设置为中国时区

-- 1. 设置数据库默认时区为中国时区（永久设置）
ALTER DATABASE postgres SET timezone = 'Asia/Shanghai';

-- 2. 设置当前会话时区为中国时区
SET TIME ZONE 'Asia/Shanghai';

-- 3. 更新所有触发器函数使用中国时区
-- 更新 user-management 表的触发器函数
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW() AT TIME ZONE 'Asia/Shanghai';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 更新 apikeys 表的触发器函数
CREATE OR REPLACE FUNCTION public.update_apikeys_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.更新时间 = NOW() AT TIME ZONE 'Asia/Shanghai';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 更新 common_variables 表的触发器函数
CREATE OR REPLACE FUNCTION public.update_common_variables_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.更新时间 = NOW() AT TIME ZONE 'Asia/Shanghai';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 更新 app_config 表的触发器函数
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.更新时间 = NOW() AT TIME ZONE 'Asia/Shanghai';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. 更新现有函数中的时间处理为中国时区
-- 更新 update_variable_by_name 函数中的时间处理
CREATE OR REPLACE FUNCTION public.update_variable_by_name(
  p_original_name TEXT,
  p_new_name TEXT,
  p_value TEXT,
  p_enabled BOOLEAN DEFAULT true
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_variable_id UUID;
  v_user_id UUID;
  v_old_value TEXT;
BEGIN
  -- 检查是否为管理员
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can manage variables';
  END IF;
  
  v_user_id := auth.uid();
  
  -- 获取旧值用于版本控制
  SELECT 变量值 INTO v_old_value
  FROM public."common_variables"
  WHERE 变量名 = p_original_name;
  
  -- 更新现有的常用变量（使用中国时区）
  UPDATE public."common_variables" 
  SET 
    变量名 = p_new_name,
    变量值 = p_value,
    是否启用 = p_enabled,
    更新时间 = NOW() AT TIME ZONE 'Asia/Shanghai',
    最后修改者 = v_user_id,
    版本号 = 版本号 + 1,
    上一版本值 = v_old_value
  WHERE 变量名 = p_original_name
  RETURNING id INTO v_variable_id;
  
  IF v_variable_id IS NULL THEN
    RAISE EXCEPTION 'Variable not found: %', p_original_name;
  END IF;
  
  RETURN v_variable_id;
END;
$$;

-- 更新 update_api_key_by_name 函数中的时间处理
CREATE OR REPLACE FUNCTION public.update_api_key_by_name(
  p_original_name TEXT,
  p_new_name TEXT,
  p_key TEXT,
  p_provider TEXT,
  p_enabled BOOLEAN DEFAULT true
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_key_id UUID;
  v_user_id UUID;
BEGIN
  -- 检查是否为管理员
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can manage API keys';
  END IF;
  
  v_user_id := auth.uid();
  
  -- 更新现有的API密钥（使用中国时区）
  UPDATE public."apikeys" 
  SET 
    名称 = p_new_name,
    密钥 = p_key,
    提供商 = p_provider,
    是否启用 = p_enabled,
    更新时间 = NOW() AT TIME ZONE 'Asia/Shanghai',
    最后修改者 = v_user_id
  WHERE 名称 = p_original_name
  RETURNING id INTO v_key_id;
  
  IF v_key_id IS NULL THEN
    RAISE EXCEPTION 'API key not found: %', p_original_name;
  END IF;
  
  RETURN v_key_id;
END;
$$;

-- 5. 修改表的默认值使用中国时区
-- 修改 user-management 表的默认值
ALTER TABLE "user-management" ALTER COLUMN created_at SET DEFAULT (NOW() AT TIME ZONE 'Asia/Shanghai');
ALTER TABLE "user-management" ALTER COLUMN updated_at SET DEFAULT (NOW() AT TIME ZONE 'Asia/Shanghai');

-- 修改 apikeys 表的默认值
ALTER TABLE "apikeys" ALTER COLUMN "创建时间" SET DEFAULT (NOW() AT TIME ZONE 'Asia/Shanghai');
ALTER TABLE "apikeys" ALTER COLUMN "更新时间" SET DEFAULT (NOW() AT TIME ZONE 'Asia/Shanghai');
ALTER TABLE "apikeys" ALTER COLUMN "最后使用时间" SET DEFAULT (NOW() AT TIME ZONE 'Asia/Shanghai');

-- 修改 common_variables 表的默认值
ALTER TABLE "common_variables" ALTER COLUMN "创建时间" SET DEFAULT (NOW() AT TIME ZONE 'Asia/Shanghai');
ALTER TABLE "common_variables" ALTER COLUMN "更新时间" SET DEFAULT (NOW() AT TIME ZONE 'Asia/Shanghai');

-- 修改 exchange-cards 表的默认值
ALTER TABLE "exchange-cards" ALTER COLUMN "兑换时间" SET DEFAULT (NOW() AT TIME ZONE 'Asia/Shanghai');

-- 修改 points_log 表的默认值
ALTER TABLE "points_log" ALTER COLUMN "创建时间" SET DEFAULT (NOW() AT TIME ZONE 'Asia/Shanghai');

-- 修改 tasks 表的默认值
ALTER TABLE "tasks" ALTER COLUMN "创建时间" SET DEFAULT (NOW() AT TIME ZONE 'Asia/Shanghai');
ALTER TABLE "tasks" ALTER COLUMN "更新时间" SET DEFAULT (NOW() AT TIME ZONE 'Asia/Shanghai');

-- 修改 app_config 表的默认值
ALTER TABLE "app_config" ALTER COLUMN "创建时间" SET DEFAULT (NOW() AT TIME ZONE 'Asia/Shanghai');
ALTER TABLE "app_config" ALTER COLUMN "更新时间" SET DEFAULT (NOW() AT TIME ZONE 'Asia/Shanghai');

-- 6. 创建一些实用的时间函数
-- 获取当前中国时间
CREATE OR REPLACE FUNCTION public.get_china_time()
RETURNS TIMESTAMPTZ AS $$
BEGIN
  RETURN NOW() AT TIME ZONE 'Asia/Shanghai';
END;
$$ LANGUAGE plpgsql;

-- 格式化中国时间为字符串
CREATE OR REPLACE FUNCTION public.format_china_time(input_time TIMESTAMPTZ)
RETURNS TEXT AS $$
BEGIN
  RETURN to_char(input_time AT TIME ZONE 'Asia/Shanghai', 'YYYY-MM-DD HH24:MI:SS');
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.get_china_time() IS '获取当前中国时间';
COMMENT ON FUNCTION public.format_china_time(TIMESTAMPTZ) IS '将时间戳格式化为中国时区的字符串';