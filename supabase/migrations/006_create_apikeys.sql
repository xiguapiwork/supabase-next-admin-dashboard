-- 创建 API Keys 表
CREATE TABLE public."apikeys" (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- API Key 基本信息
  名称 TEXT NOT NULL UNIQUE, -- API Key 的名称/标识
  key TEXT NOT NULL, -- API Key 的实际值（明文存储）
  
  -- 状态管理
  是否启用 BOOLEAN DEFAULT true, -- 是否启用此 API Key
  
  -- 使用统计
  使用次数 INTEGER DEFAULT 0, -- 使用次数统计
  最后使用时间 TIMESTAMP WITH TIME ZONE, -- 最后使用时间
  
  -- 时间戳
  创建时间 TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  更新时间 TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  创建者 UUID REFERENCES public."user-management"(id) ON DELETE SET NULL
);

-- 创建索引
CREATE INDEX idx_apikeys_name ON public."apikeys"(名称);
CREATE INDEX idx_apikeys_enabled ON public."apikeys"(是否启用);
CREATE INDEX idx_apikeys_created_at ON public."apikeys"(创建时间);

-- 启用 RLS (Row Level Security)
ALTER TABLE public."apikeys" ENABLE ROW LEVEL SECURITY;

-- RLS 策略：只有管理员可以查看 API Keys
CREATE POLICY "admin_select_apikeys" ON public."apikeys"
FOR SELECT USING (is_admin());

-- 只有管理员可以插入 API Keys
CREATE POLICY "admin_insert_apikeys" ON public."apikeys"
FOR INSERT WITH CHECK (is_admin());

-- 只有管理员可以更新 API Keys
CREATE POLICY "admin_update_apikeys" ON public."apikeys"
FOR UPDATE USING (is_admin());

-- 只有管理员可以删除 API Keys
CREATE POLICY "admin_delete_apikeys" ON public."apikeys"
FOR DELETE USING (is_admin());

-- 系统服务可以读取启用的 API Keys（用于 Edge Functions）
CREATE POLICY "system_read_enabled_apikeys" ON public."apikeys"
FOR SELECT USING (是否启用 = true);

-- 创建获取 API Key 的函数（供 Edge Functions 使用）
CREATE OR REPLACE FUNCTION public.get_api_key(p_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_key TEXT;
BEGIN
  -- 获取启用的 API Key
  SELECT key INTO v_key
  FROM public."apikeys"
  WHERE 名称 = p_name AND 是否启用 = true;
  
  -- 更新使用统计
  IF v_key IS NOT NULL THEN
    UPDATE public."apikeys"
    SET 
      使用次数 = 使用次数 + 1,
      最后使用时间 = NOW(),
      更新时间 = NOW()
    WHERE 名称 = p_name;
  END IF;
  
  RETURN v_key;
END;
$$;

-- 创建添加/更新 API Key 的函数
CREATE OR REPLACE FUNCTION public.upsert_api_key(
  p_name TEXT,
  p_key TEXT,
  p_enabled BOOLEAN DEFAULT true
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_api_key_id UUID;
  v_user_id UUID;
BEGIN
  -- 检查是否为管理员
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can manage API keys';
  END IF;
  
  v_user_id := auth.uid();
  
  -- 插入或更新 API Key
  INSERT INTO public."apikeys" (名称, key, 是否启用, 创建者) 
  VALUES (p_name, p_key, p_enabled, v_user_id)
  ON CONFLICT (名称) DO UPDATE SET
    key = EXCLUDED.key,
    是否启用 = EXCLUDED.是否启用,
    更新时间 = NOW()
  RETURNING id INTO v_api_key_id;
  
  RETURN v_api_key_id;
END;
$$;

-- 创建删除 API Key 的函数
CREATE OR REPLACE FUNCTION public.delete_api_key(p_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- 检查是否为管理员
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can manage API keys';
  END IF;
  
  -- 删除 API Key
  DELETE FROM public."apikeys" WHERE 名称 = p_name;
  
  RETURN FOUND;
END;
$$;

-- 创建切换 API Key 状态的函数
CREATE OR REPLACE FUNCTION public.toggle_api_key(p_name TEXT, p_enabled BOOLEAN)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- 检查是否为管理员
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can manage API keys';
  END IF;
  
  -- 更新 API Key 状态
  UPDATE public."apikeys" 
  SET 
    是否启用 = p_enabled,
    更新时间 = NOW()
  WHERE 名称 = p_name;
  
  RETURN FOUND;
END;
$$;

-- 创建获取 API Keys 列表的函数（管理员用）
CREATE OR REPLACE FUNCTION public.get_api_keys_list()
RETURNS TABLE (
  id UUID,
  名称 TEXT,
  key_masked TEXT, -- 掩码显示的 Key
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
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can view API keys list';
  END IF;
  
  -- 返回 API Keys 列表（Key 掩码显示）
  RETURN QUERY
  SELECT 
    ak.id,
    ak.名称,
    CASE 
      WHEN LENGTH(ak.key) > 8 THEN 
        LEFT(ak.key, 4) || '****' || RIGHT(ak.key, 4)
      ELSE 
        '****'
    END as key_masked,
    ak.是否启用,
    ak.使用次数,
    ak.最后使用时间,
    ak.创建时间,
    u.username as 创建者名称
  FROM public."apikeys" ak
  LEFT JOIN public."user-management" u ON ak.创建者 = u.id
  ORDER BY ak.创建时间 DESC;
END;
$$;

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION public.update_apikeys_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.更新时间 = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_apikeys_updated_at
  BEFORE UPDATE ON public."apikeys"
  FOR EACH ROW
  EXECUTE FUNCTION public.update_apikeys_updated_at();