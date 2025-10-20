-- 创建积分变动记录表
CREATE TABLE public."points_log" (
  积分记录ID UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  用户ID UUID NOT NULL REFERENCES public."user-management"(id) ON DELETE CASCADE,
  
  -- 积分变动信息
  变动前积分 INTEGER NOT NULL, -- 变动前积分
  积分变动量 INTEGER NOT NULL, -- 积分变动量（正数为增加，负数为扣除）
  变动后积分 INTEGER NOT NULL, -- 变动后积分
  
  -- 变动类型和原因
  变动类型 TEXT NOT NULL CHECK (变动类型 IN ('card_redeem', 'feature_usage', 'refund', 'admin_adjust')),
  变动原因 TEXT NOT NULL, -- 变动原因描述
  
  -- 关联信息
  兑换卡卡号 TEXT REFERENCES public."exchange-cards"(卡号) ON DELETE SET NULL, -- 如果是兑换卡获得积分
  任务ID UUID, -- 如果是功能使用，关联任务ID（外键约束稍后添加）
  
  -- 操作信息
  操作人ID UUID REFERENCES public."user-management"(id) ON DELETE SET NULL, -- 操作人（管理员调整时使用）
  
  -- 时间戳
  创建时间 TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引提高查询性能
CREATE INDEX idx_points_log_user_id ON public."points_log"(用户ID);
CREATE INDEX idx_points_log_created_at ON public."points_log"(创建时间);
CREATE INDEX idx_points_log_change_type ON public."points_log"(变动类型);
CREATE INDEX idx_points_log_task_id ON public."points_log"(任务ID);

-- 启用RLS
ALTER TABLE public."points_log" ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略
-- 用户只能查看自己的积分记录
CREATE POLICY "Users can view their own points log" ON public."points_log"
FOR SELECT USING (用户ID = auth.uid());

-- 管理员可以查看所有积分记录
CREATE POLICY "Admins can view all points log" ON public."points_log"
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public."user-management" 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 系统可以插入积分记录（通过函数）
CREATE POLICY "System can insert points log" ON public."points_log"
FOR INSERT WITH CHECK (true);

-- 管理员可以插入积分记录（手动调整）
CREATE POLICY "Admins can insert points log" ON public."points_log"
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public."user-management" 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 创建积分变动函数
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
  v_log_id UUID;
BEGIN
  -- 获取用户当前积分（加行锁防止并发问题）
  SELECT points INTO v_points_before 
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
  
  -- 更新用户积分
  UPDATE public."user-management" 
  SET points = v_points_after, updated_at = NOW()
  WHERE id = p_user_id;
  
  -- 插入积分记录
  INSERT INTO public."points_log" (
    用户ID, 变动前积分, 积分变动量, 变动后积分, 变动类型, 变动原因, 兑换卡卡号, 任务ID, 操作人ID
  ) VALUES (
    p_user_id, v_points_before, p_points_change, v_points_after, p_change_type, p_reason, p_exchange_card_number, p_task_id, p_operator_id
  ) RETURNING 积分记录ID INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;