-- 创建功能与积分配置表 (app_config)
-- 支持层级结构：分类 -> 功能
-- 用于管理各种功能的积分消耗配置

CREATE TABLE public.app_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID REFERENCES public.app_config(id) ON DELETE CASCADE,
  配置名称 TEXT NOT NULL,
  配置类型 TEXT NOT NULL CHECK (配置类型 IN ('category', 'function')),
  积分消耗 DECIMAL(10,2) DEFAULT 0.00 CHECK (积分消耗 >= 0),
  排序顺序 INTEGER DEFAULT 0,
  备注 TEXT,
  创建时间 TIMESTAMPTZ DEFAULT NOW(),
  更新时间 TIMESTAMPTZ DEFAULT NOW(),
  创建者 UUID REFERENCES auth.users(id),
  最后修改者 UUID REFERENCES auth.users(id)
);

-- 创建索引
CREATE INDEX idx_app_config_parent_id ON public.app_config(parent_id);
CREATE INDEX idx_app_config_type ON public.app_config(配置类型);
CREATE INDEX idx_app_config_sort ON public.app_config(排序顺序);

-- 创建复合索引用于查询优化
CREATE INDEX idx_app_config_parent_sort ON public.app_config(parent_id, 排序顺序);

-- 启用 RLS (Row Level Security)
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

-- RLS 策略：管理员可以查看所有配置，所有用户可以读取配置
CREATE POLICY "select_config" ON public.app_config
FOR SELECT USING (public.is_admin() OR true);

CREATE POLICY "admin_insert_config" ON public.app_config
FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "admin_update_config" ON public.app_config
FOR UPDATE USING (public.is_admin());

CREATE POLICY "admin_delete_config" ON public.app_config
FOR DELETE USING (public.is_admin());

-- 创建管理函数

-- 1. 获取功能的积分消耗
CREATE OR REPLACE FUNCTION public.get_function_points(function_name TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  points DECIMAL(10,2);
BEGIN
  SELECT 积分消耗 INTO points
  FROM public.app_config
  WHERE 配置名称 = function_name 
    AND 配置类型 = 'function';
  
  RETURN COALESCE(points, 0);
END;
$$;

-- 2. 获取分类下的所有功能
CREATE OR REPLACE FUNCTION public.get_functions_by_category(category_name TEXT)
RETURNS TABLE(
  id UUID,
  功能名称 TEXT,
  积分消耗 DECIMAL(10,2),
  排序顺序 INTEGER,
  备注 TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  category_id UUID;
BEGIN
  -- 获取分类ID
  SELECT ac.id INTO category_id
  FROM public.app_config ac
  WHERE ac.配置名称 = category_name 
    AND ac.配置类型 = 'category';
  
  IF category_id IS NULL THEN
    RETURN;
  END IF;
  
  -- 返回该分类下的所有功能
  RETURN QUERY
  SELECT 
    ac.id,
    ac.配置名称,
    ac.积分消耗,
    ac.排序顺序,
    ac.备注
  FROM public.app_config ac
  WHERE ac.parent_id = category_id 
    AND ac.配置类型 = 'function'
  ORDER BY ac.排序顺序, ac.配置名称;
END;
$$;

-- 3. 获取完整的配置树结构
CREATE OR REPLACE FUNCTION public.get_app_config_tree()
RETURNS TABLE(
  id UUID,
  parent_id UUID,
  配置名称 TEXT,
  配置类型 TEXT,
  积分消耗 DECIMAL(10,2),
  排序顺序 INTEGER,
  备注 TEXT,
  层级 INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE config_tree AS (
    -- 根节点（分类）
    SELECT 
      ac.id,
      ac.parent_id,
      ac.配置名称,
      ac.配置类型,
      ac.积分消耗,
      ac.排序顺序,
      ac.备注,
      0 as 层级
    FROM public.app_config ac
    WHERE ac.parent_id IS NULL
    
    UNION ALL
    
    -- 子节点
    SELECT 
      ac.id,
      ac.parent_id,
      ac.配置名称,
      ac.配置类型,
      ac.积分消耗,
      ac.排序顺序,
      ac.备注,
      ct.层级 + 1
    FROM public.app_config ac
    INNER JOIN config_tree ct ON ac.parent_id = ct.id
  )
  SELECT * FROM config_tree
  ORDER BY 层级, 排序顺序, 配置名称;
END;
$$;

-- 4. 添加或更新配置（管理员专用）
CREATE OR REPLACE FUNCTION public.upsert_app_config(
  config_id UUID DEFAULT NULL,
  p_parent_id UUID DEFAULT NULL,
  p_配置名称 TEXT DEFAULT NULL,
  p_配置类型 TEXT DEFAULT NULL,
  p_积分消耗 DECIMAL(10,2) DEFAULT 0.00,
  p_排序顺序 INTEGER DEFAULT 0,
  p_备注 TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  result_id UUID;
  current_user_id UUID;
BEGIN
  -- 检查管理员权限
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION '权限不足：只有管理员可以管理配置';
  END IF;
  
  current_user_id := auth.uid();
  
  IF config_id IS NOT NULL THEN
    -- 更新现有配置
    UPDATE public.app_config SET
      parent_id = COALESCE(p_parent_id, parent_id),
      配置名称 = COALESCE(p_配置名称, 配置名称),
      配置类型 = COALESCE(p_配置类型, 配置类型),
      积分消耗 = COALESCE(p_积分消耗, 积分消耗),
      排序顺序 = COALESCE(p_排序顺序, 排序顺序),
      备注 = COALESCE(p_备注, 备注),
      更新时间 = NOW(),
      最后修改者 = current_user_id
    WHERE id = config_id;
    
    result_id := config_id;
  ELSE
    -- 插入新配置
    INSERT INTO public.app_config (
      parent_id, 配置名称, 配置类型, 积分消耗, 排序顺序, 备注, 创建者, 最后修改者
    ) VALUES (
      p_parent_id, p_配置名称, p_配置类型, p_积分消耗, p_排序顺序, p_备注, current_user_id, current_user_id
    ) RETURNING id INTO result_id;
  END IF;
  
  RETURN result_id;
END;
$$;

-- 5. 删除配置（管理员专用）
CREATE OR REPLACE FUNCTION public.delete_app_config(config_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- 检查管理员权限
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION '权限不足：只有管理员可以删除配置';
  END IF;
  
  DELETE FROM public.app_config WHERE id = config_id;
  
  RETURN FOUND;
END;
$$;

-- 6. 获取配置列表（管理员专用）
CREATE OR REPLACE FUNCTION public.get_app_config_list()
RETURNS TABLE(
  id UUID,
  parent_id UUID,
  配置名称 TEXT,
  配置类型 TEXT,
  积分消耗 DECIMAL(10,2),
  排序顺序 INTEGER,
  备注 TEXT,
  创建时间 TIMESTAMPTZ,
  更新时间 TIMESTAMPTZ,
  创建者_邮箱 TEXT,
  最后修改者_邮箱 TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- 检查管理员权限
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION '权限不足：只有管理员可以查看配置列表';
  END IF;
  
  RETURN QUERY
  SELECT 
    ac.id,
    ac.parent_id,
    ac.配置名称,
    ac.配置类型,
    ac.积分消耗,
    ac.排序顺序,
    ac.备注,
    ac.创建时间,
    ac.更新时间,
    creator.email::TEXT as 创建者_邮箱,
    modifier.email::TEXT as 最后修改者_邮箱
  FROM public.app_config ac
  LEFT JOIN auth.users creator ON ac.创建者 = creator.id
  LEFT JOIN auth.users modifier ON ac.最后修改者 = modifier.id
  ORDER BY ac.排序顺序, ac.配置名称;
END;
$$;

-- 创建触发器自动更新时间戳
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.更新时间 = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_app_config_updated_at
  BEFORE UPDATE ON public.app_config
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

-- 插入默认数据
DO $$
DECLARE
  basic_category_id UUID;
BEGIN
  -- 插入基础功能分类
  INSERT INTO public.app_config (配置名称, 配置类型, 积分消耗, 排序顺序, 备注)
  VALUES ('基础功能', 'category', 0, 1, '用户基础操作功能')
  RETURNING id INTO basic_category_id;
  
  -- 插入新用户注册功能项目
  INSERT INTO public.app_config (parent_id, 配置名称, 配置类型, 积分消耗, 排序顺序, 备注) VALUES
  (basic_category_id, '新用户注册', 'function', 0, 1, '用户注册奖励（0分表示免费）');
END $$;