-- 创建日报定时任务
-- 每日中国时间0点01分自动生成前一天的日报

-- 首先确保pg_cron扩展已启用（需要在Supabase项目中手动启用）
-- 注意：pg_cron扩展需要在Supabase Dashboard中的Database > Extensions中启用

-- 创建定时任务执行函数
CREATE OR REPLACE FUNCTION public.scheduled_daily_report_job()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_report_date DATE;
  v_success BOOLEAN;
BEGIN
  -- 计算要生成报告的日期（昨天）
  v_report_date := CURRENT_DATE - INTERVAL '1 day';
  
  -- 记录任务开始
  RAISE NOTICE '定时任务开始：生成日期 % 的日报', v_report_date;
  
  -- 执行日报生成
  SELECT public.generate_daily_report(v_report_date) INTO v_success;
  
  IF v_success THEN
    RAISE NOTICE '定时任务完成：日期 % 的日报生成成功', v_report_date;
  ELSE
    RAISE EXCEPTION '定时任务失败：日期 % 的日报生成失败', v_report_date;
  END IF;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION '定时任务异常：%', SQLERRM;
END;
$$;

-- 添加函数注释
COMMENT ON FUNCTION public.scheduled_daily_report_job() IS '定时任务：每日自动生成日报';

-- 创建定时任务（需要pg_cron扩展）
-- 注意：以下SQL需要在启用pg_cron扩展后执行
-- 时间设置为中国时间每天0点01分（UTC时间16点01分，因为中国时间=UTC+8）

-- 尝试创建定时任务，如果 pg_cron 不可用则跳过
DO $$
BEGIN
  -- 检查 pg_cron 扩展是否存在
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    -- 删除可能存在的旧任务
    PERFORM cron.unschedule('daily-report-generator') WHERE EXISTS (
      SELECT 1 FROM cron.job WHERE jobname = 'daily-report-generator'
    );
    
    -- 创建新的定时任务
    -- 中国时间0点01分 = UTC时间16点01分（前一天）
    PERFORM cron.schedule(
      'daily-report-generator',           -- 任务名称
      '1 16 * * *',                      -- cron表达式：每天UTC时间16点01分（中国时间0点01分）
      'SELECT public.scheduled_daily_report_job();'  -- 要执行的SQL
    );
    
    RAISE NOTICE '定时任务已创建：daily-report-generator';
  ELSE
    RAISE NOTICE '跳过定时任务创建：pg_cron 扩展未启用';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '定时任务创建失败：%', SQLERRM;
END;
$$;

-- 创建任务状态查询函数
CREATE OR REPLACE FUNCTION public.get_daily_report_job_status()
RETURNS TABLE (
  job_name TEXT,
  schedule TEXT,
  active BOOLEAN,
  last_run TIMESTAMP WITH TIME ZONE,
  next_run TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- 检查当前用户是否为管理员
  IF NOT EXISTS (
    SELECT 1 FROM public."user-management" 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION '权限不足：只有管理员可以查看定时任务状态';
  END IF;
  
  -- 检查 pg_cron 扩展是否存在
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    -- 如果 pg_cron 未启用，返回提示信息
    RETURN QUERY
    SELECT 
      'daily-report-generator'::TEXT,
      'pg_cron 扩展未启用'::TEXT,
      FALSE,
      NULL::TIMESTAMP WITH TIME ZONE,
      NULL::TIMESTAMP WITH TIME ZONE;
    RETURN;
  END IF;
  
  -- 返回定时任务状态
  RETURN QUERY
  SELECT 
    j.jobname::TEXT,
    j.schedule::TEXT,
    j.active,
    j.last_run,
    j.next_run
  FROM cron.job j
  WHERE j.jobname = 'daily-report-generator';
  
EXCEPTION
  WHEN OTHERS THEN
    -- 如果查询失败，返回错误信息
    RETURN QUERY
    SELECT 
      'daily-report-generator'::TEXT,
      ('错误: ' || SQLERRM)::TEXT,
      FALSE,
      NULL::TIMESTAMP WITH TIME ZONE,
      NULL::TIMESTAMP WITH TIME ZONE;
END;
$$;

-- 添加函数注释
COMMENT ON FUNCTION public.get_daily_report_job_status() IS '查询日报定时任务状态（管理员专用）';

-- 创建手动启用/禁用定时任务的函数
CREATE OR REPLACE FUNCTION public.toggle_daily_report_job(enable_job BOOLEAN DEFAULT TRUE)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT,
  job_status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_is_admin BOOLEAN := FALSE;
BEGIN
  -- 检查当前用户是否为管理员
  SELECT EXISTS (
    SELECT 1 FROM public."user-management" 
    WHERE id = auth.uid() AND role = 'admin'
  ) INTO v_is_admin;
  
  IF NOT v_is_admin THEN
    RETURN QUERY SELECT FALSE, '权限不足：只有管理员可以管理定时任务'::TEXT, 'unauthorized'::TEXT;
    RETURN;
  END IF;
  
  -- 检查 pg_cron 扩展是否存在
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    RETURN QUERY SELECT FALSE, 'pg_cron 扩展未启用，无法管理定时任务'::TEXT, 'extension_not_available'::TEXT;
    RETURN;
  END IF;
  
  IF enable_job THEN
    -- 启用定时任务
    PERFORM cron.schedule(
      'daily-report-generator',
      '1 16 * * *',
      'SELECT public.scheduled_daily_report_job();'
    );
    RETURN QUERY SELECT TRUE, '定时任务已启用'::TEXT, 'enabled'::TEXT;
  ELSE
    -- 禁用定时任务
    PERFORM cron.unschedule('daily-report-generator');
    RETURN QUERY SELECT TRUE, '定时任务已禁用'::TEXT, 'disabled'::TEXT;
  END IF;
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN QUERY SELECT FALSE, ('操作失败: ' || SQLERRM)::TEXT, 'error'::TEXT;
END;
$$;

-- 添加函数注释
COMMENT ON FUNCTION public.toggle_daily_report_job(BOOLEAN) IS '启用或禁用日报定时任务（管理员专用）';

-- 创建查询日报数据的函数
CREATE OR REPLACE FUNCTION public.get_daily_reports(
  start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  end_date DATE DEFAULT CURRENT_DATE,
  limit_count INTEGER DEFAULT 50,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  日期 DATE,
  总用户数 INTEGER,
  总付费用户数 INTEGER,
  新增用户数 INTEGER,
  新增付费用户数 INTEGER,
  新增付费用户兑换积分 DECIMAL(10,2),
  新增兑换卡片数量 INTEGER,
  新增兑换卡片积分 DECIMAL(10,2),
  总兑换卡片数量 INTEGER,
  总兑换卡片积分 DECIMAL(10,2),
  新增积分消耗 DECIMAL(10,2),
  新增扣分消耗次数 INTEGER,
  总积分消耗 DECIMAL(10,2),
  总积分消耗次数 INTEGER,
  创建时间 TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- 检查当前用户是否为管理员
  IF NOT EXISTS (
    SELECT 1 FROM public."user-management" 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION '权限不足：只有管理员可以查看日报数据';
  END IF;
  
  -- 返回日报数据
  RETURN QUERY
  SELECT 
    dr.日期,
    dr.总用户数,
    dr.总付费用户数,
    dr.新增用户数,
    dr.新增付费用户数,
    dr.新增付费用户兑换积分,
    dr.新增兑换卡片数量,
    dr.新增兑换卡片积分,
    dr.总兑换卡片数量,
    dr.总兑换卡片积分,
    dr.新增积分消耗,
    dr.新增扣分消耗次数,
    dr.总积分消耗,
    dr.总积分消耗次数,
    dr.创建时间
  FROM public."daily_reports" dr
  WHERE dr.日期 >= start_date AND dr.日期 <= end_date
  ORDER BY dr.日期 DESC
  LIMIT limit_count OFFSET offset_count;
END;
$$;

-- 添加函数注释
COMMENT ON FUNCTION public.get_daily_reports(DATE, DATE, INTEGER, INTEGER) IS '查询日报数据（管理员专用）';