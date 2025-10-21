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
-- 用户可以查看自己的积分记录，管理员可以查看所有积分记录
CREATE POLICY "select_points_log" ON public."points_log"
FOR SELECT USING (
  用户ID = (select auth.uid()) OR 
  EXISTS (
    SELECT 1 FROM public."user-management" 
    WHERE id = (select auth.uid()) AND role = 'admin'
  )
);

-- 系统和管理员可以插入积分记录
CREATE POLICY "insert_points_log" ON public."points_log"
FOR INSERT WITH CHECK (
  true OR 
  EXISTS (
    SELECT 1 FROM public."user-management" 
    WHERE id = (select auth.uid()) AND role = 'admin'
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

-- 获取积分变动日志列表函数（管理员专用）
CREATE OR REPLACE FUNCTION get_points_logs_list(
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0,
  p_search_term TEXT DEFAULT '',
  p_action_filter TEXT DEFAULT 'all',
  p_sort_field TEXT DEFAULT '创建时间',
  p_sort_order TEXT DEFAULT 'desc'
)
RETURNS TABLE (
  积分记录ID UUID,
  用户ID UUID,
  变动前积分 INTEGER,
  积分变动量 INTEGER,
  变动后积分 INTEGER,
  变动类型 TEXT,
  变动原因 TEXT,
  兑换卡卡号 TEXT,
  任务ID UUID,
  操作人ID UUID,
  创建时间 TIMESTAMP WITH TIME ZONE,
  username TEXT,
  user_email TEXT,
  user_avatar TEXT,
  operator_username TEXT,
  operator_email TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_sql TEXT;
  v_where_conditions TEXT[] := ARRAY[]::TEXT[];
  v_order_by TEXT;
BEGIN
  -- 检查是否为管理员
  IF NOT EXISTS (
    SELECT 1 FROM public."user-management" 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION '只有管理员可以查看积分变动日志列表';
  END IF;
  
  -- 构建WHERE条件
  IF p_search_term != '' THEN
    v_where_conditions := array_append(v_where_conditions, 
      format('(u.username ILIKE ''%%%s%%'' OR au.email ILIKE ''%%%s%%'' OR pl.变动原因 ILIKE ''%%%s%%'' OR pl.任务ID::TEXT ILIKE ''%%%s%%'')', 
        p_search_term, p_search_term, p_search_term, p_search_term));
  END IF;
  
  IF p_action_filter != 'all' THEN
    v_where_conditions := array_append(v_where_conditions, 
      format('pl.变动类型 = ''%s''', p_action_filter));
  END IF;
  
  -- 构建ORDER BY子句
  v_order_by := format('ORDER BY pl.%I %s', p_sort_field, 
    CASE WHEN upper(p_sort_order) = 'DESC' THEN 'DESC' ELSE 'ASC' END);
  
  -- 构建完整SQL
  v_sql := format('
    SELECT 
      pl.积分记录ID,
      pl.用户ID,
      pl.变动前积分,
      pl.积分变动量,
      pl.变动后积分,
      pl.变动类型,
      pl.变动原因,
      pl.兑换卡卡号,
      pl.任务ID,
      pl.操作人ID,
      pl.创建时间,
      COALESCE(u.username, '''')::text as username,
      COALESCE(au.email, '''')::text as user_email,
      COALESCE(u.avatar, '''')::text as user_avatar,
      COALESCE(op.username, '''')::text as operator_username,
      COALESCE(aop.email, '''')::text as operator_email
    FROM public."points_log" pl
    LEFT JOIN public."user-management" u ON pl.用户ID = u.id
    LEFT JOIN auth.users au ON pl.用户ID = au.id
    LEFT JOIN public."user-management" op ON pl.操作人ID = op.id
    LEFT JOIN auth.users aop ON pl.操作人ID = aop.id
    %s
    %s
    LIMIT %s OFFSET %s',
    CASE WHEN array_length(v_where_conditions, 1) > 0 
         THEN 'WHERE ' || array_to_string(v_where_conditions, ' AND ') 
         ELSE '' END,
    v_order_by,
    p_limit,
    p_offset
  );
  
  RETURN QUERY EXECUTE v_sql;
END;
$$;

-- 获取积分变动日志总数函数（管理员专用）
CREATE OR REPLACE FUNCTION get_points_logs_count(
  p_search_term TEXT DEFAULT '',
  p_action_filter TEXT DEFAULT 'all'
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_sql TEXT;
  v_where_conditions TEXT[] := ARRAY[]::TEXT[];
  v_count INTEGER;
BEGIN
  -- 检查是否为管理员
  IF NOT EXISTS (
    SELECT 1 FROM public."user-management" 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION '只有管理员可以查看积分变动日志总数';
  END IF;
  
  -- 构建WHERE条件
  IF p_search_term != '' THEN
    v_where_conditions := array_append(v_where_conditions, 
      format('(u.username ILIKE ''%%%s%%'' OR u.email ILIKE ''%%%s%%'' OR pl.变动原因 ILIKE ''%%%s%%'' OR pl.任务ID::TEXT ILIKE ''%%%s%%'')', 
        p_search_term, p_search_term, p_search_term, p_search_term));
  END IF;
  
  IF p_action_filter != 'all' THEN
    v_where_conditions := array_append(v_where_conditions, 
      format('pl.变动类型 = ''%s''', p_action_filter));
  END IF;
  
  -- 构建完整SQL
  v_sql := format('
    SELECT COUNT(*)
    FROM public."points_log" pl
    LEFT JOIN public."user-management" u ON pl.用户ID = u.id
    %s',
    CASE WHEN array_length(v_where_conditions, 1) > 0 
         THEN 'WHERE ' || array_to_string(v_where_conditions, ' AND ') 
         ELSE '' END
  );
  
  EXECUTE v_sql INTO v_count;
  RETURN v_count;
END;
$$;