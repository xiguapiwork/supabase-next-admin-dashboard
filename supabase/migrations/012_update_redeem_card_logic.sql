-- 更新兑换卡逻辑，支持根据用户角色生成不同的变动原因
-- 并自动将普通用户升级为付费用户

-- 更新兑换卡片函数
CREATE OR REPLACE FUNCTION redeem_card(card_number TEXT, user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  card_points INTEGER;
  current_status BOOLEAN;
  user_role TEXT;
  reason_text TEXT;
BEGIN
  -- 检查卡片是否存在且未被兑换（加行锁防止并发兑换）
  SELECT 积分数量, 状态 INTO card_points, current_status
  FROM public."exchange-cards"
  WHERE 卡号 = card_number
  FOR UPDATE;
  
  IF NOT FOUND OR current_status != true THEN
    RETURN FALSE;
  END IF;
  
  -- 获取用户当前角色
  SELECT role INTO user_role
  FROM public."user-management"
  WHERE id = user_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- 根据用户角色生成不同的变动原因
  CASE user_role
    WHEN 'user' THEN
      reason_text := '新用户兑换：' || card_number;
    WHEN 'paid' THEN
      reason_text := '老用户兑换：' || card_number;
    WHEN 'admin' THEN
      reason_text := '管理员兑换：' || card_number;
    ELSE
      reason_text := '兑换卡号：' || card_number; -- 默认情况
  END CASE;
  
  -- 更新卡片状态
  UPDATE public."exchange-cards"
  SET 状态 = false,
      兑换人 = user_id,
      兑换时间 = NOW()
  WHERE 卡号 = card_number;
  
  -- 如果是普通用户，自动升级为付费用户并记录首次付费时间
  IF user_role = 'user' THEN
    UPDATE public."user-management"
    SET role = 'paid',
        first_payment_time = NOW(),
        updated_at = NOW()
    WHERE id = user_id;
  END IF;
  
  -- 添加积分记录（add_points_log 函数会自动更新用户积分）
  PERFORM public.add_points_log(
    user_id,
    card_points,
    'card_redeem',
    reason_text,     -- 使用根据角色生成的变动原因
    card_number,     -- 兑换卡卡号
    NULL,            -- 任务ID
    user_id          -- 操作人
  );
  
  RETURN TRUE;
END;
$$;