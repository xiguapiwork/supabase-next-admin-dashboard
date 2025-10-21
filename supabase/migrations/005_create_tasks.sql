-- 创建任务表
CREATE TABLE public."tasks" (
  任务ID UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- 用户信息
  用户ID UUID NOT NULL REFERENCES public."user-management"(id) ON DELETE CASCADE,
  
  -- 任务基本信息
  任务类型 TEXT NOT NULL, -- 任务类型（如：'image_generation', 'text_analysis', 'api_call'等）
  任务名称 TEXT NOT NULL, -- 任务名称
  
  -- 任务状态
  状态 TEXT NOT NULL DEFAULT 'pending' CHECK (状态 IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  
  -- 积分相关
  积分消耗 INTEGER NOT NULL CHECK (积分消耗 > 0), -- 任务消耗的积分
  扣除记录ID UUID REFERENCES public."points_log"(积分记录ID) ON DELETE SET NULL, -- 关联的积分扣除记录
  退款记录ID UUID REFERENCES public."points_log"(积分记录ID) ON DELETE SET NULL, -- 如果失败，关联的退款记录
  
  -- 任务参数和结果
  任务参数 JSONB, -- 任务参数（JSON格式存储）
  任务结果 JSONB, -- 任务结果（JSON格式存储）
  错误信息 TEXT, -- 错误信息
  
  -- 处理信息
  开始时间 TIMESTAMP WITH TIME ZONE, -- 开始处理时间
  完成时间 TIMESTAMP WITH TIME ZONE, -- 完成时间
  
  -- 元数据
  元数据 JSONB, -- 额外的元数据
  
  -- 时间戳
  创建时间 TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  更新时间 TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_tasks_user_id ON public."tasks"(用户ID);
CREATE INDEX idx_tasks_status ON public."tasks"(状态);
CREATE INDEX idx_tasks_task_type ON public."tasks"(任务类型);
CREATE INDEX idx_tasks_created_at ON public."tasks"(创建时间);
CREATE INDEX idx_tasks_points_log_id ON public."tasks"(扣除记录ID);

-- 启用RLS
ALTER TABLE public."tasks" ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略
-- 用户可以查看自己的任务，管理员可以查看所有任务
CREATE POLICY "select_tasks" ON public."tasks"
FOR SELECT USING (
  用户ID = (select auth.uid()) OR 
  EXISTS (
    SELECT 1 FROM public."user-management" 
    WHERE id = (select auth.uid()) AND role = 'admin'
  )
);

-- 用户可以创建自己的任务
CREATE POLICY "Users can create their own tasks" ON public."tasks"
FOR INSERT WITH CHECK (用户ID = (select auth.uid()));

-- 系统和管理员可以更新任务
CREATE POLICY "update_tasks" ON public."tasks"
FOR UPDATE USING (
  true OR 
  EXISTS (
    SELECT 1 FROM public."user-management" 
    WHERE id = (select auth.uid()) AND role = 'admin'
  )
);

-- 添加外键约束到 points_log 表
ALTER TABLE public."points_log" 
ADD CONSTRAINT fk_points_log_task_id 
FOREIGN KEY (任务ID) REFERENCES public."tasks"(任务ID) ON DELETE SET NULL;

-- 创建任务创建函数
CREATE OR REPLACE FUNCTION public.create_task(
  p_user_id UUID,
  p_task_type TEXT,
  p_task_name TEXT,
  p_task_params JSONB DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL,
  p_points_cost INTEGER DEFAULT NULL -- 设为可选参数
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_task_id UUID;
  v_points_log_id UUID;
  v_final_points_cost INTEGER;
BEGIN
  -- 1. 决定积分消耗
  IF p_points_cost IS NOT NULL THEN
    v_final_points_cost := p_points_cost; -- 直接使用传入值
  ELSE
    SELECT public.get_function_points(p_task_name) INTO v_final_points_cost; -- 动态获取
    IF v_final_points_cost IS NULL THEN
      RAISE EXCEPTION '功能 "%" 未配置且未提供自定义积分', p_task_name;
    END IF;
  END IF;

  -- 2. 创建任务记录
  INSERT INTO public."tasks" (
    用户ID, 任务类型, 任务名称, 积分消耗, 任务参数, 元数据
  ) VALUES (
    p_user_id, p_task_type, p_task_name, v_final_points_cost, p_task_params, p_metadata
  ) RETURNING 任务ID INTO v_task_id;

  -- 3. 如果需要变动积分
  IF v_final_points_cost != 0 THEN
    SELECT public.add_points_log(
      p_user_id,
      -v_final_points_cost, -- 负值扣除，正值增加
      CASE WHEN v_final_points_cost > 0 THEN 'feature_usage' ELSE 'refund' END,
      format('处理任务: %s', p_task_name),
      NULL, v_task_id, p_user_id
    ) INTO v_points_log_id;

    -- 4. 回写日志ID
    UPDATE public."tasks" SET 扣除记录ID = v_points_log_id WHERE 任务ID = v_task_id;
  END IF;
  
  RETURN v_task_id;
END;
$$;

-- 创建任务失败退款函数
CREATE OR REPLACE FUNCTION public.refund_failed_task(p_task_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_task RECORD;
  v_refund_log_id UUID;
BEGIN
  SELECT * INTO v_task FROM public."tasks" WHERE 任务ID = p_task_id;
  
  IF v_task IS NULL THEN RAISE EXCEPTION '未找到任务'; END IF;
  IF v_task.状态 != 'failed' THEN RAISE EXCEPTION '只有失败的任务才能退款'; END IF;
  IF v_task.积分消耗 <= 0 OR v_task.退款记录ID IS NOT NULL THEN RETURN NULL; END IF;
  
  SELECT public.add_points_log(
    v_task.用户ID, v_task.积分消耗, 'refund',
    format('任务失败退款: %s', v_task.任务名称),
    NULL, p_task_id, NULL
  ) INTO v_refund_log_id;
  
  UPDATE public."tasks" SET 退款记录ID = v_refund_log_id WHERE 任务ID = p_task_id;
  RETURN v_refund_log_id;
END;
$$;

-- 创建更新任务状态的函数
CREATE OR REPLACE FUNCTION public.update_task_status(
  p_task_id UUID,
  p_status TEXT,
  p_task_result JSONB DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_old_status TEXT;
BEGIN
  -- 获取当前状态
  SELECT 状态 INTO v_old_status
  FROM public."tasks"
  WHERE 任务ID = p_task_id;
  
  IF v_old_status IS NULL THEN
    RAISE EXCEPTION 'Task not found';
  END IF;
  
  -- 更新任务状态
  UPDATE public."tasks" 
  SET 
    状态 = p_status,
    任务结果 = COALESCE(p_task_result, 任务结果),
    错误信息 = p_error_message,
    开始时间 = CASE 
      WHEN p_status = 'processing' AND 开始时间 IS NULL THEN NOW()
      ELSE 开始时间 
    END,
    完成时间 = CASE 
      WHEN p_status IN ('completed', 'failed', 'cancelled') THEN NOW()
      ELSE 完成时间 
    END,
    更新时间 = NOW()
  WHERE 任务ID = p_task_id;
  
  -- 如果任务失败，自动退款
  IF p_status = 'failed' AND v_old_status != 'failed' THEN
    PERFORM public.refund_failed_task(p_task_id);
  END IF;
  
  RETURN TRUE;
END;
$$;

-- 创建触发器函数，当任务插入时触发边缘函数
CREATE OR REPLACE FUNCTION public.trigger_task_processing()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- 这里可以调用边缘函数或发送通知
  -- 例如：PERFORM net.http_post('https://your-edge-function-url', NEW.id::text);
  
  -- 暂时只更新状态为processing
  UPDATE public."tasks" 
  SET 状态 = 'processing', 开始时间 = NOW(), 更新时间 = NOW()
  WHERE 任务ID = NEW.任务ID;
  
  RETURN NEW;
END;
$$;

-- 创建触发器
CREATE TRIGGER trigger_new_task_processing
  AFTER INSERT ON public."tasks"
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_task_processing();