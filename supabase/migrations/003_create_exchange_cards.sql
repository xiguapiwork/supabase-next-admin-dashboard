-- 创建兑换卡表
CREATE TABLE public."exchange-cards" (
  卡号 TEXT PRIMARY KEY,
  卡片名称 TEXT NOT NULL,
  积分数量 INTEGER NOT NULL CHECK (积分数量 > 0),
  备注 TEXT,
  状态 BOOLEAN DEFAULT true, -- true: 可用, false: 已兑换
  兑换人 UUID REFERENCES public."user-management"(id) ON DELETE SET NULL,
  创建时间 TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  兑换时间 TIMESTAMP WITH TIME ZONE
);

-- 启用RLS
ALTER TABLE public."exchange-cards" ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略
-- 管理员可以查看所有兑换卡，用户可以查看自己兑换的卡片
CREATE POLICY "select_exchange_cards" ON public."exchange-cards"
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public."user-management" 
    WHERE id = (select auth.uid()) AND role = 'admin'
  ) OR 兑换人 = (select auth.uid())
);

-- 管理员可以插入新的兑换卡
CREATE POLICY "Admins can insert exchange cards" ON public."exchange-cards"
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public."user-management" 
    WHERE id = (select auth.uid()) AND role = 'admin'
  )
);

-- 管理员可以更新兑换卡，用户可以兑换卡片
CREATE POLICY "update_exchange_cards" ON public."exchange-cards"
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public."user-management" 
    WHERE id = (select auth.uid()) AND role = 'admin'
  ) OR (状态 = true AND 兑换人 IS NULL)
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM public."user-management" 
    WHERE id = (select auth.uid()) AND role = 'admin'
  ) OR (兑换人 = (select auth.uid()) AND 状态 = false AND 兑换时间 IS NOT NULL)
);

-- 管理员可以删除兑换卡
CREATE POLICY "Admins can delete exchange cards" ON public."exchange-cards"
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public."user-management" 
    WHERE id = (select auth.uid()) AND role = 'admin'
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
  current_status BOOLEAN;
BEGIN
  -- 检查卡片是否存在且未被兑换（加行锁防止并发兑换）
  SELECT 积分数量, 状态 INTO card_points, current_status
  FROM public."exchange-cards"
  WHERE 卡号 = card_number
  FOR UPDATE;
  
  IF NOT FOUND OR current_status != true THEN
    RETURN FALSE;
  END IF;
  
  -- 更新卡片状态
  UPDATE public."exchange-cards"
  SET 状态 = false,
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
  状态 BOOLEAN,
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
  可用数量 BIGINT,
  已兑换数量 BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as 总数量,
    COUNT(*) FILTER (WHERE 状态 = true) as 可用数量,
    COUNT(*) FILTER (WHERE 状态 = false) as 已兑换数量
  FROM public."exchange-cards";
END;
$$;

-- 生成16位随机卡号函数
CREATE OR REPLACE FUNCTION generate_card_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  result TEXT := '';
  i INTEGER;
  card_exists BOOLEAN;
BEGIN
  LOOP
    result := '';
    -- 生成16位随机字符串
    FOR i IN 1..16 LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    
    -- 检查卡号是否已存在
    SELECT EXISTS(SELECT 1 FROM public."exchange-cards" WHERE 卡号 = result) INTO card_exists;
    
    -- 如果不存在则返回
    IF NOT card_exists THEN
      RETURN result;
    END IF;
  END LOOP;
END;
$$;

-- 批量创建兑换卡函数
CREATE OR REPLACE FUNCTION batch_create_exchange_cards(
  p_card_name TEXT,
  p_points INTEGER,
  p_description TEXT DEFAULT NULL,
  p_quantity INTEGER DEFAULT 1
)
RETURNS TABLE (
  卡号 TEXT,
  卡片名称 TEXT,
  积分数量 INTEGER,
  备注 TEXT,
  状态 BOOLEAN,
  创建时间 TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  i INTEGER;
  new_card_number TEXT;
  creator_id UUID;
BEGIN
  -- 检查是否为管理员
  SELECT id INTO creator_id FROM public."user-management" 
  WHERE id = auth.uid() AND role = 'admin';
  
  IF creator_id IS NULL THEN
    RAISE EXCEPTION '只有管理员可以创建兑换卡';
  END IF;
  
  -- 验证输入参数
  IF p_quantity < 1 OR p_quantity > 100 THEN
    RAISE EXCEPTION '创建数量必须在1-100之间';
  END IF;
  
  IF p_points <= 0 THEN
    RAISE EXCEPTION '积分数量必须大于0';
  END IF;
  
  -- 批量创建兑换卡
  FOR i IN 1..p_quantity LOOP
    new_card_number := public.generate_card_number();
    
    INSERT INTO public."exchange-cards" (
      卡号, 卡片名称, 积分数量, 备注
    ) VALUES (
      new_card_number, p_card_name, p_points, p_description
    );
    
    -- 返回创建的卡片信息
    RETURN QUERY
    SELECT 
      new_card_number,
      p_card_name,
      p_points,
      p_description,
      true,
      NOW()::TIMESTAMP WITH TIME ZONE;
  END LOOP;
END;
$$;

-- 获取兑换卡列表函数（管理员专用）
CREATE OR REPLACE FUNCTION get_exchange_cards_list()
RETURNS TABLE (
  卡号 TEXT,
  卡片名称 TEXT,
  积分数量 INTEGER,
  备注 TEXT,
  状态 BOOLEAN,
  兑换人 UUID,
  创建时间 TIMESTAMP WITH TIME ZONE,
  兑换时间 TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- 检查是否为管理员
  IF NOT EXISTS (
    SELECT 1 FROM public."user-management" 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION '只有管理员可以查看兑换卡列表';
  END IF;
  
  RETURN QUERY
  SELECT 
    e.卡号,
    e.卡片名称,
    e.积分数量,
    e.备注,
    e.状态,
    e.兑换人,
    e.创建时间,
    e.兑换时间
  FROM public."exchange-cards" e
  ORDER BY e.创建时间 DESC;
END;
$$;

-- 更新兑换卡函数
CREATE OR REPLACE FUNCTION update_exchange_card(
  p_card_number TEXT,
  p_card_name TEXT,
  p_points INTEGER,
  p_description TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  card_status BOOLEAN;
BEGIN
  -- 检查是否为管理员
  IF NOT EXISTS (
    SELECT 1 FROM public."user-management" 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION '只有管理员可以更新兑换卡';
  END IF;
  
  -- 检查卡片是否存在
  SELECT 状态 INTO card_status FROM public."exchange-cards" WHERE 卡号 = p_card_number;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION '兑换卡不存在';
  END IF;
  
  -- 如果卡片已被兑换，只允许更新名称和备注
  IF card_status = false THEN
    UPDATE public."exchange-cards"
    SET 卡片名称 = p_card_name,
        备注 = p_description
    WHERE 卡号 = p_card_number;
  ELSE
    -- 未兑换的卡片可以更新所有字段
    UPDATE public."exchange-cards"
    SET 卡片名称 = p_card_name,
        积分数量 = p_points,
        备注 = p_description
    WHERE 卡号 = p_card_number;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- 删除兑换卡函数
CREATE OR REPLACE FUNCTION delete_exchange_card(p_card_number TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- 检查是否为管理员
  IF NOT EXISTS (
    SELECT 1 FROM public."user-management" 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION '只有管理员可以删除兑换卡';
  END IF;
  
  -- 删除兑换卡
  DELETE FROM public."exchange-cards" WHERE 卡号 = p_card_number;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION '兑换卡不存在';
  END IF;
  
  RETURN TRUE;
END;
$$;

-- 批量删除兑换卡函数
CREATE OR REPLACE FUNCTION batch_delete_exchange_cards(p_card_numbers TEXT[])
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- 检查是否为管理员
  IF NOT EXISTS (
    SELECT 1 FROM public."user-management" 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION '只有管理员可以删除兑换卡';
  END IF;
  
  -- 批量删除兑换卡
  DELETE FROM public."exchange-cards" WHERE 卡号 = ANY(p_card_numbers);
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$;

-- 创建更新时间戳触发器（如果需要updated_at字段的话）
-- 注意：这里没有添加updated_at字段，如果需要可以添加