-- 创建兑换卡表
CREATE TABLE public."exchange-cards" (
  卡号 TEXT PRIMARY KEY,
  卡片名称 TEXT NOT NULL,
  积分数量 INTEGER NOT NULL CHECK (积分数量 > 0),
  备注 TEXT,
  状态 TEXT DEFAULT '未兑换' CHECK (状态 IN ('未兑换', '已兑换', '已过期')),
  兑换人 UUID REFERENCES public."user-management"(id) ON DELETE SET NULL,
  创建时间 TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  兑换时间 TIMESTAMP WITH TIME ZONE
);

-- 启用RLS
ALTER TABLE public."exchange-cards" ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略
-- 管理员可以查看所有兑换卡
CREATE POLICY "Admins can view all exchange cards" ON public."exchange-cards"
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public."user-management" 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 用户只能查看自己兑换的卡片
CREATE POLICY "Users can view their own exchange cards" ON public."exchange-cards"
FOR SELECT USING (兑换人 = auth.uid());

-- 管理员可以插入新的兑换卡
CREATE POLICY "Admins can insert exchange cards" ON public."exchange-cards"
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public."user-management" 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 管理员可以更新兑换卡
CREATE POLICY "Admins can update exchange cards" ON public."exchange-cards"
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public."user-management" 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 用户可以兑换卡片（更新兑换人和兑换时间）
CREATE POLICY "Users can redeem cards" ON public."exchange-cards"
FOR UPDATE USING (
  状态 = '未兑换' AND 兑换人 IS NULL
) WITH CHECK (
  兑换人 = auth.uid() AND 状态 = '已兑换' AND 兑换时间 IS NOT NULL
);

-- 管理员可以删除兑换卡
CREATE POLICY "Admins can delete exchange cards" ON public."exchange-cards"
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public."user-management" 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 创建索引以提高查询性能
CREATE INDEX idx_exchange_cards_status ON public."exchange-cards"(状态);
CREATE INDEX idx_exchange_cards_redeemer ON public."exchange-cards"(兑换人);
CREATE INDEX idx_exchange_cards_created_at ON public."exchange-cards"(创建时间);

-- 创建兑换卡相关的辅助函数

-- 兑换卡片函数
CREATE OR REPLACE FUNCTION redeem_card(card_number TEXT, user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  card_points INTEGER;
  current_status TEXT;
BEGIN
  -- 检查卡片是否存在且未被兑换（加行锁防止并发兑换）
  SELECT 积分数量, 状态 INTO card_points, current_status
  FROM public."exchange-cards"
  WHERE 卡号 = card_number
  FOR UPDATE;
  
  IF NOT FOUND OR current_status != '未兑换' THEN
    RETURN FALSE;
  END IF;
  
  -- 更新卡片状态
  UPDATE public."exchange-cards"
  SET 状态 = '已兑换',
      兑换人 = user_id,
      兑换时间 = NOW()
  WHERE 卡号 = card_number;
  
  -- 添加积分记录（add_points_log 函数会自动更新用户积分）
  PERFORM public.add_points_log(
    user_id,
    card_points,
    'card_redeem',
    '兑换卡号: ' || card_number,
    card_number, -- 兑换卡卡号
    NULL,        -- 任务ID
    user_id      -- 操作人
  );
  
  RETURN TRUE;
END;
$$;

-- 获取用户兑换历史
CREATE OR REPLACE FUNCTION get_user_exchange_history(user_id UUID DEFAULT auth.uid())
RETURNS TABLE (
  卡号 TEXT,
  卡片名称 TEXT,
  积分数量 INTEGER,
  备注 TEXT,
  状态 TEXT,
  创建时间 TIMESTAMP WITH TIME ZONE,
  兑换时间 TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT e.卡号, e.卡片名称, e.积分数量, e.备注, e.状态, e.创建时间, e.兑换时间
  FROM public."exchange-cards" e
  WHERE e.兑换人 = user_id
  ORDER BY e.兑换时间 DESC;
END;
$$;

-- 获取可用兑换卡统计
CREATE OR REPLACE FUNCTION get_exchange_cards_stats()
RETURNS TABLE (
  总数量 BIGINT,
  未兑换数量 BIGINT,
  已兑换数量 BIGINT,
  已过期数量 BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as 总数量,
    COUNT(*) FILTER (WHERE 状态 = '未兑换') as 未兑换数量,
    COUNT(*) FILTER (WHERE 状态 = '已兑换') as 已兑换数量,
    COUNT(*) FILTER (WHERE 状态 = '已过期') as 已过期数量
  FROM public."exchange-cards";
END;
$$;

-- 创建更新时间戳触发器（如果需要updated_at字段的话）
-- 注意：这里没有添加updated_at字段，如果需要可以添加