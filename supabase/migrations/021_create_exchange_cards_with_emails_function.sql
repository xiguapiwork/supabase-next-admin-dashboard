-- 创建兑换卡列表函数（管理员专用，包含完整邮箱信息）
-- 该函数允许管理员获取所有兑换卡信息，包括兑换人的真实邮箱地址

CREATE OR REPLACE FUNCTION get_exchange_cards_with_emails()
RETURNS TABLE (
  卡号 TEXT,
  卡片名称 TEXT,
  积分数量 DECIMAL(10,2),
  备注 TEXT,
  状态 BOOLEAN,
  兑换人 UUID,
  创建时间 TIMESTAMP WITH TIME ZONE,
  兑换时间 TIMESTAMP WITH TIME ZONE,
  兑换人用户名 TEXT,
  兑换人邮箱 TEXT,
  兑换人头像 TEXT
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
    RAISE EXCEPTION '只有管理员可以查看兑换卡列表';
  END IF;
  
  -- 返回兑换卡数据，包含兑换人的完整信息
  RETURN QUERY
  SELECT 
    e.卡号,
    e.卡片名称,
    e.积分数量,
    e.备注,
    e.状态,
    e.兑换人,
    e.创建时间,
    e.兑换时间,
    COALESCE(u.username, '')::text,
    COALESCE(au.email, '')::text,
    COALESCE(u.avatar, '')::text
  FROM public."exchange-cards" e
  LEFT JOIN public."user-management" u ON e.兑换人 = u.id
  LEFT JOIN auth.users au ON e.兑换人 = au.id
  ORDER BY e.创建时间 DESC;
END;
$$;