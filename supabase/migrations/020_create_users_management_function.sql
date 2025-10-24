-- 创建用户管理列表函数（管理员专用）
-- 该函数允许管理员获取所有用户的完整信息，包括真实邮箱地址

CREATE OR REPLACE FUNCTION get_users_management_list()
RETURNS TABLE (
  id UUID,
  username TEXT,
  email TEXT,
  role TEXT,
  avatar TEXT,
  points DECIMAL(10,2),
  total_usage DECIMAL(10,2),
  total_redeem DECIMAL(10,2),
  redeem_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  备注 TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- 检查是否为管理员
  IF NOT EXISTS (
    SELECT 1 FROM public."user-management" um
    WHERE um.id = auth.uid() AND um.role = 'admin'
  ) THEN
    RAISE EXCEPTION '只有管理员可以查看用户管理列表';
  END IF;
  
  -- 返回用户管理数据，包含真实邮箱
  RETURN QUERY
  SELECT 
    u.id,
    COALESCE(u.username, '')::text,
    COALESCE(au.email, '')::text,
    COALESCE(u.role, 'user')::text,
    COALESCE(u.avatar, '')::text,
    COALESCE(u.points, 0)::DECIMAL(10,2),
    COALESCE(u.total_usage, 0)::DECIMAL(10,2),
    COALESCE(u.total_redeem, 0)::DECIMAL(10,2),
    COALESCE(u.redeem_count, 0)::INTEGER,
    u.created_at,
    u.updated_at,
    COALESCE(u.备注, '')::text
  FROM public."user-management" u
  LEFT JOIN auth.users au ON u.id = au.id
  ORDER BY u.created_at DESC;
END;
$$;

-- 添加函数注释
COMMENT ON FUNCTION get_users_management_list() IS '获取用户管理列表，包含完整邮箱信息（仅管理员可用）';

-- 授予执行权限
GRANT EXECUTE ON FUNCTION get_users_management_list() TO authenticated;