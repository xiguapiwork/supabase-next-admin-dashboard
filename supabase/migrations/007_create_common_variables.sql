-- 创建常用变量表
CREATE TABLE public."common_variables" (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- 变量基本信息
  变量名 TEXT NOT NULL UNIQUE, -- 变量的唯一标识名称
  变量值 TEXT NOT NULL, -- 变量的实际内容（支持多行文本）
  
  -- 状态管理
  是否启用 BOOLEAN DEFAULT true, -- 是否启用此变量
  
  -- 使用统计
  使用次数 INTEGER DEFAULT 0, -- 使用次数统计
  最后使用时间 TIMESTAMP WITH TIME ZONE, -- 最后使用时间
  
  -- 版本控制
  版本号 INTEGER DEFAULT 1, -- 版本号
  上一版本值 TEXT, -- 保存上一个版本的值
  
  -- 时间戳
  创建时间 TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  更新时间 TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  创建者 UUID REFERENCES public."user-management"(id) ON DELETE SET NULL,
  最后修改者 UUID REFERENCES public."user-management"(id) ON DELETE SET NULL
);

-- 创建索引
CREATE INDEX idx_common_variables_name ON public."common_variables"(变量名);
CREATE INDEX idx_common_variables_enabled ON public."common_variables"(是否启用);
CREATE INDEX idx_common_variables_created_at ON public."common_variables"(创建时间);

-- 启用 RLS (Row Level Security)
ALTER TABLE public."common_variables" ENABLE ROW LEVEL SECURITY;

-- RLS 策略：只有管理员可以查看所有变量
CREATE POLICY "admin_select_variables" ON public."common_variables"
FOR SELECT USING (is_admin());

-- 只有管理员可以插入变量
CREATE POLICY "admin_insert_variables" ON public."common_variables"
FOR INSERT WITH CHECK (is_admin());

-- 只有管理员可以更新变量
CREATE POLICY "admin_update_variables" ON public."common_variables"
FOR UPDATE USING (is_admin());

-- 只有管理员可以删除变量
CREATE POLICY "admin_delete_variables" ON public."common_variables"
FOR DELETE USING (is_admin());

-- 系统服务可以读取启用的变量（用于 Edge Functions）
CREATE POLICY "system_read_enabled_variables" ON public."common_variables"
FOR SELECT USING (是否启用 = true);

-- 创建获取变量值的函数（供应用程序使用）
CREATE OR REPLACE FUNCTION public.get_variable(p_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_value TEXT;
BEGIN
  -- 获取启用的变量值
  SELECT 变量值 INTO v_value
  FROM public."common_variables"
  WHERE 变量名 = p_name AND 是否启用 = true;
  
  -- 更新使用统计
  IF v_value IS NOT NULL THEN
    UPDATE public."common_variables"
    SET 
      使用次数 = 使用次数 + 1,
      最后使用时间 = NOW(),
      更新时间 = NOW()
    WHERE 变量名 = p_name;
  END IF;
  
  RETURN v_value;
END;
$$;

-- 创建添加/更新变量的函数
CREATE OR REPLACE FUNCTION public.upsert_variable(
  p_name TEXT,
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
BEGIN
  -- 检查是否为管理员
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can manage variables';
  END IF;
  
  v_user_id := auth.uid();
  
  -- 插入或更新变量
  INSERT INTO public."common_variables" (变量名, 变量值, 是否启用, 创建者) 
  VALUES (p_name, p_value, p_enabled, v_user_id)
  ON CONFLICT (变量名) DO UPDATE SET
    变量值 = EXCLUDED.变量值,
    是否启用 = EXCLUDED.是否启用,
    更新时间 = NOW()
  RETURNING id INTO v_variable_id;
  
  RETURN v_variable_id;
END;
$$;

-- 创建删除变量的函数
CREATE OR REPLACE FUNCTION public.delete_variable(p_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- 检查是否为管理员
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can manage variables';
  END IF;
  
  -- 删除变量
  DELETE FROM public."common_variables" WHERE 变量名 = p_name;
  
  RETURN FOUND;
END;
$$;

-- 创建切换变量状态的函数
CREATE OR REPLACE FUNCTION public.toggle_variable(
  p_name TEXT,
  p_enabled BOOLEAN
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- 检查是否为管理员
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can manage variables';
  END IF;
  
  -- 更新变量状态
  UPDATE public."common_variables" 
  SET 
    是否启用 = p_enabled,
    更新时间 = NOW()
  WHERE 变量名 = p_name;
  
  RETURN FOUND;
END;
$$;

-- 创建获取变量列表的函数（管理员用）
CREATE OR REPLACE FUNCTION public.get_variables_list()
RETURNS TABLE (
  id UUID,
  变量名 TEXT,
  变量值 TEXT,
  是否启用 BOOLEAN,
  使用次数 INTEGER,
  最后使用时间 TIMESTAMP WITH TIME ZONE,
  创建时间 TIMESTAMP WITH TIME ZONE,
  创建者名称 TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- 检查是否为管理员
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can view variables list';
  END IF;
  
  -- 返回变量列表
  RETURN QUERY
  SELECT 
    cv.id,
    cv.变量名,
    cv.变量值,
    cv.是否启用,
    cv.使用次数,
    cv.最后使用时间,
    cv.创建时间,
    u.username as 创建者名称
  FROM public."common_variables" cv
  LEFT JOIN public."user-management" u ON cv.创建者 = u.id
  ORDER BY cv.创建时间 DESC;
END;
$$;

-- 创建获取变量详情的函数（管理员用）
CREATE OR REPLACE FUNCTION public.get_variable_detail(p_name TEXT)
RETURNS TABLE (
  id UUID,
  变量名 TEXT,
  变量值 TEXT,
  是否启用 BOOLEAN,
  使用次数 INTEGER,
  最后使用时间 TIMESTAMP WITH TIME ZONE,
  创建时间 TIMESTAMP WITH TIME ZONE,
  创建者名称 TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- 检查是否为管理员
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can view variable details';
  END IF;
  
  -- 返回变量详情
  RETURN QUERY
  SELECT 
    cv.id,
    cv.变量名,
    cv.变量值,
    cv.是否启用,
    cv.使用次数,
    cv.最后使用时间,
    cv.创建时间,
    u.username as 创建者名称
  FROM public."common_variables" cv
  LEFT JOIN public."user-management" u ON cv.创建者 = u.id
  WHERE cv.变量名 = p_name;
END;
$$;

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION public.update_common_variables_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.更新时间 = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_common_variables_updated_at
  BEFORE UPDATE ON public."common_variables"
  FOR EACH ROW
  EXECUTE FUNCTION public.update_common_variables_updated_at();

-- 创建更新常用变量的函数（通过原始名称）
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
  
  -- 更新现有的常用变量
  UPDATE public."common_variables" 
  SET 
    变量名 = p_new_name,
    变量值 = p_value,
    是否启用 = p_enabled,
    更新时间 = NOW(),
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

-- 常用变量表创建完成，初始为空表格
-- 管理员可以通过管理界面添加所需的变量