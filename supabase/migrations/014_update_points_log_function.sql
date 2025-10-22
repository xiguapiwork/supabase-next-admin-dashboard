-- 更新积分变动函数，同时维护total_usage和total_redeem字段
-- 确保积分流动的完整跟踪

CREATE OR REPLACE FUNCTION public.add_points_log(
  p_user_id UUID,
  p_points_change INTEGER,
  p_change_type TEXT,
  p_reason TEXT,
  p_exchange_card_number TEXT DEFAULT NULL,
  p_task_id UUID DEFAULT NULL,
  p_operator_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_points_before INTEGER;
  v_points_after INTEGER;
  v_total_usage_before INTEGER;
  v_total_redeem_before INTEGER;
  v_total_usage_after INTEGER;
  v_total_redeem_after INTEGER;
  v_log_id UUID;
BEGIN
  -- 获取用户当前积分和统计信息（加行锁防止并发问题）
  SELECT points, total_usage, total_redeem 
  INTO v_points_before, v_total_usage_before, v_total_redeem_before
  FROM public."user-management" 
  WHERE id = p_user_id
  FOR UPDATE;
  
  IF v_points_before IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- 计算变动后积分
  v_points_after := v_points_before + p_points_change;
  
  -- 检查积分不能为负数（除非是管理员调整）
  IF v_points_after < 0 AND p_change_type != 'admin_adjust' THEN
    RAISE EXCEPTION 'Insufficient points';
  END IF;
  
  -- 初始化统计字段的新值
  v_total_usage_after := v_total_usage_before;
  v_total_redeem_after := v_total_redeem_before;
  
  -- 根据变动类型更新相应的统计字段
  CASE p_change_type
    WHEN 'card_redeem' THEN
      -- 兑换卡片：增加total_redeem
      IF p_points_change > 0 THEN
        v_total_redeem_after := v_total_redeem_before + p_points_change;
      END IF;
    
    WHEN 'feature_usage' THEN
      -- 功能使用：增加total_usage（积分变动量为负数）
      IF p_points_change < 0 THEN
        v_total_usage_after := v_total_usage_before + ABS(p_points_change);
      END IF;
    
    WHEN 'refund' THEN
      -- 退款：如果是正数，减少total_usage；如果是负数，减少total_redeem
      IF p_points_change > 0 THEN
        -- 正数退款：减少total_usage（但不能小于0）
        v_total_usage_after := GREATEST(0, v_total_usage_before - p_points_change);
      ELSIF p_points_change < 0 THEN
        -- 负数退款：减少total_redeem（但不能小于0）
        v_total_redeem_after := GREATEST(0, v_total_redeem_before - ABS(p_points_change));
      END IF;
    
    WHEN 'admin_adjust' THEN
      -- 管理员调整：根据调整方向更新相应字段
      IF p_points_change > 0 THEN
        -- 正数调整：增加total_redeem
        v_total_redeem_after := v_total_redeem_before + p_points_change;
      ELSIF p_points_change < 0 THEN
        -- 负数调整：增加total_usage
        v_total_usage_after := v_total_usage_before + ABS(p_points_change);
      END IF;
    
    ELSE
      -- 其他类型：不更新统计字段，仅记录日志
      NULL;
  END CASE;
  
  -- 更新用户积分和统计信息
  UPDATE public."user-management" 
  SET 
    points = v_points_after,
    total_usage = v_total_usage_after,
    total_redeem = v_total_redeem_after,
    updated_at = NOW()
  WHERE id = p_user_id;
  
  -- 插入积分记录
  INSERT INTO public."points_log" (
    用户ID, 变动前积分, 积分变动量, 变动后积分, 变动类型, 变动原因, 兑换卡卡号, 任务ID, 操作人ID
  ) VALUES (
    p_user_id, v_points_before, p_points_change, v_points_after, p_change_type, p_reason, p_exchange_card_number, p_task_id, p_operator_id
  ) RETURNING 积分记录ID INTO v_log_id;
  
  -- 记录调试信息（可选）
  RAISE NOTICE '积分变动记录: 用户ID=%, 类型=%, 变动量=%, 当前积分=%, 总使用=%, 总兑换=%', 
    p_user_id, p_change_type, p_points_change, v_points_after, v_total_usage_after, v_total_redeem_after;
  
  RETURN v_log_id;
END;
$$;

-- 添加函数注释
COMMENT ON FUNCTION public.add_points_log(UUID, INTEGER, TEXT, TEXT, TEXT, UUID, UUID) IS '记录积分变动并同时维护total_usage和total_redeem统计字段';

-- 创建积分统计修复函数（用于修复可能的数据不一致）
CREATE OR REPLACE FUNCTION public.fix_user_points_stats(p_user_id UUID DEFAULT NULL)
RETURNS TABLE (
  user_id UUID,
  old_total_usage INTEGER,
  new_total_usage INTEGER,
  old_total_redeem INTEGER,
  new_total_redeem INTEGER,
  fixed BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  user_record RECORD;
  calculated_usage INTEGER;
  calculated_redeem INTEGER;
BEGIN
  -- 如果指定了用户ID，只修复该用户；否则修复所有用户
  FOR user_record IN 
    SELECT id, total_usage, total_redeem 
    FROM public."user-management" 
    WHERE (p_user_id IS NULL OR id = p_user_id)
  LOOP
    -- 计算正确的total_usage（所有负数变动的绝对值之和）
    SELECT COALESCE(SUM(ABS(积分变动量)), 0) INTO calculated_usage
    FROM public."points_log"
    WHERE 用户ID = user_record.id 
      AND 积分变动量 < 0 
      AND 变动类型 IN ('feature_usage', 'admin_adjust');
    
    -- 计算正确的total_redeem（所有正数变动之和）
    SELECT COALESCE(SUM(积分变动量), 0) INTO calculated_redeem
    FROM public."points_log"
    WHERE 用户ID = user_record.id 
      AND 积分变动量 > 0 
      AND 变动类型 IN ('card_redeem', 'admin_adjust', 'refund');
    
    -- 如果计算值与当前值不同，则更新
    IF user_record.total_usage != calculated_usage OR user_record.total_redeem != calculated_redeem THEN
      UPDATE public."user-management"
      SET 
        total_usage = calculated_usage,
        total_redeem = calculated_redeem,
        updated_at = NOW()
      WHERE id = user_record.id;
      
      -- 返回修复结果
      RETURN QUERY SELECT 
        user_record.id,
        user_record.total_usage,
        calculated_usage,
        user_record.total_redeem,
        calculated_redeem,
        true;
    ELSE
      -- 返回未修复结果
      RETURN QUERY SELECT 
        user_record.id,
        user_record.total_usage,
        calculated_usage,
        user_record.total_redeem,
        calculated_redeem,
        false;
    END IF;
  END LOOP;
END;
$$;

-- 添加函数注释
COMMENT ON FUNCTION public.fix_user_points_stats(UUID) IS '修复用户积分统计数据，确保total_usage和total_redeem与积分日志一致';