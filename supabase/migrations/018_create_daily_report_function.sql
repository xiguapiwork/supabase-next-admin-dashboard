-- 创建日报数据计算函数
-- 计算指定日期的所有统计数据并插入或更新日报表

CREATE OR REPLACE FUNCTION public.generate_daily_report(report_date DATE DEFAULT CURRENT_DATE - INTERVAL '1 day')
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  -- 变量声明
  v_total_users INTEGER := 0;
  v_total_paid_users INTEGER := 0;
  v_new_users INTEGER := 0;
  v_new_paid_users INTEGER := 0;
  v_new_paid_users_points INTEGER := 0;
  v_new_redeem_count INTEGER := 0;
  v_new_redeem_points INTEGER := 0;
  v_total_redeem_count INTEGER := 0;
  v_total_redeem_points INTEGER := 0;
  v_new_consumption INTEGER := 0;
  v_new_consumption_count INTEGER := 0;
  v_total_consumption INTEGER := 0;
  v_total_consumption_count INTEGER := 0;
  
  -- 前一天的累计数据
  v_prev_total_redeem_count INTEGER := 0;
  v_prev_total_redeem_points INTEGER := 0;
  v_prev_total_consumption INTEGER := 0;
  v_prev_total_consumption_count INTEGER := 0;
  
  -- 日期范围
  v_start_date TIMESTAMP WITH TIME ZONE;
  v_end_date TIMESTAMP WITH TIME ZONE;
BEGIN
  -- 设置日期范围（报告日期的00:00:00到23:59:59）
  v_start_date := report_date::TIMESTAMP WITH TIME ZONE;
  v_end_date := (report_date + INTERVAL '1 day')::TIMESTAMP WITH TIME ZONE;
  
  RAISE NOTICE '开始生成日报，日期: %, 时间范围: % 到 %', report_date, v_start_date, v_end_date;
  
  -- 1. 计算总用户数（截止到报告日期的总用户数）
  SELECT COUNT(*) INTO v_total_users
  FROM public."user-management"
  WHERE created_at <= v_end_date;
  
  -- 2. 计算总付费用户数（截止到报告日期的总付费用户数）
  SELECT COUNT(*) INTO v_total_paid_users
  FROM public."user-management"
  WHERE created_at <= v_end_date 
    AND role IN ('paid', 'admin');
  
  -- 3. 计算新增用户数（报告日期当天注册的用户总数）
  SELECT COUNT(*) INTO v_new_users
  FROM public."user-management"
  WHERE created_at >= v_start_date 
    AND created_at < v_end_date;
  
  -- 4. 计算新增付费用户数（报告日期当天积分日志变动原因中新用户兑换的数量）
  SELECT COUNT(DISTINCT pl.用户ID) INTO v_new_paid_users
  FROM public."points_log" pl
  WHERE pl.创建时间 >= v_start_date 
    AND pl.创建时间 < v_end_date
    AND pl.变动类型 = 'card_redeem'
    AND pl.变动原因 LIKE '%新用户兑换%';
  
  -- 5. 计算新增付费用户的兑换积分（报告日期当天积分日志变动原因中新用户兑换的对应积分总和）
  SELECT COALESCE(SUM(pl.积分变动量), 0) INTO v_new_paid_users_points
  FROM public."points_log" pl
  WHERE pl.创建时间 >= v_start_date 
    AND pl.创建时间 < v_end_date
    AND pl.变动类型 = 'card_redeem'
    AND pl.变动原因 LIKE '%新用户兑换%';
  
  -- 6. 计算新增兑换卡片数量（报告日期当天变动类型中是card_redeem兑换的总次数）
  SELECT COUNT(*) INTO v_new_redeem_count
  FROM public."points_log" pl
  WHERE pl.创建时间 >= v_start_date 
    AND pl.创建时间 < v_end_date
    AND pl.变动类型 = 'card_redeem';
  
  -- 7. 计算新增兑换卡片积分（报告日期当天变动类型中是card_redeem兑换的总积分）
  SELECT COALESCE(SUM(pl.积分变动量), 0) INTO v_new_redeem_points
  FROM public."points_log" pl
  WHERE pl.创建时间 >= v_start_date 
    AND pl.创建时间 < v_end_date
    AND pl.变动类型 = 'card_redeem';
  
  -- 8. 获取前一天的累计数据（用于计算总数）
  SELECT 
    COALESCE(总兑换卡片数量, 0),
    COALESCE(总兑换卡片积分, 0),
    COALESCE(总积分消耗, 0),
    COALESCE(总积分消耗次数, 0)
  INTO 
    v_prev_total_redeem_count,
    v_prev_total_redeem_points,
    v_prev_total_consumption,
    v_prev_total_consumption_count
  FROM public."daily_reports"
  WHERE 日期 = report_date - INTERVAL '1 day';
  
  -- 9. 计算总兑换卡片数量（前天的总兑换卡数量加上新增兑换卡片数量）
  v_total_redeem_count := v_prev_total_redeem_count + v_new_redeem_count;
  
  -- 10. 计算总兑换卡片积分（前天的总兑换卡积分加上新增兑换卡片积分）
  v_total_redeem_points := v_prev_total_redeem_points + v_new_redeem_points;
  
  -- 11. 计算新增积分消耗（报告日期当天所有扣分的积分总和）
  SELECT COALESCE(SUM(ABS(pl.积分变动量)), 0) INTO v_new_consumption
  FROM public."points_log" pl
  WHERE pl.创建时间 >= v_start_date 
    AND pl.创建时间 < v_end_date
    AND pl.积分变动量 < 0;
  
  -- 12. 计算新增扣分消耗次数（报告日期当天所有扣分的积分次数总和）
  SELECT COUNT(*) INTO v_new_consumption_count
  FROM public."points_log" pl
  WHERE pl.创建时间 >= v_start_date 
    AND pl.创建时间 < v_end_date
    AND pl.积分变动量 < 0;
  
  -- 13. 计算总积分消耗（前天的总积分消耗加上新增积分消耗）
  v_total_consumption := v_prev_total_consumption + v_new_consumption;
  
  -- 14. 计算总积分消耗次数（前天的总积分消耗次数加上新增积分消耗次数）
  v_total_consumption_count := v_prev_total_consumption_count + v_new_consumption_count;
  
  -- 插入或更新日报数据
  INSERT INTO public."daily_reports" (
    日期,
    总用户数,
    总付费用户数,
    新增用户数,
    新增付费用户数,
    新增付费用户兑换积分,
    新增兑换卡片数量,
    新增兑换卡片积分,
    总兑换卡片数量,
    总兑换卡片积分,
    新增积分消耗,
    新增扣分消耗次数,
    总积分消耗,
    总积分消耗次数,
    创建时间,
    更新时间
  ) VALUES (
    report_date,
    v_total_users,
    v_total_paid_users,
    v_new_users,
    v_new_paid_users,
    v_new_paid_users_points,
    v_new_redeem_count,
    v_new_redeem_points,
    v_total_redeem_count,
    v_total_redeem_points,
    v_new_consumption,
    v_new_consumption_count,
    v_total_consumption,
    v_total_consumption_count,
    NOW(),
    NOW()
  )
  ON CONFLICT (日期) DO UPDATE SET
    总用户数 = EXCLUDED.总用户数,
    总付费用户数 = EXCLUDED.总付费用户数,
    新增用户数 = EXCLUDED.新增用户数,
    新增付费用户数 = EXCLUDED.新增付费用户数,
    新增付费用户兑换积分 = EXCLUDED.新增付费用户兑换积分,
    新增兑换卡片数量 = EXCLUDED.新增兑换卡片数量,
    新增兑换卡片积分 = EXCLUDED.新增兑换卡片积分,
    总兑换卡片数量 = EXCLUDED.总兑换卡片数量,
    总兑换卡片积分 = EXCLUDED.总兑换卡片积分,
    新增积分消耗 = EXCLUDED.新增积分消耗,
    新增扣分消耗次数 = EXCLUDED.新增扣分消耗次数,
    总积分消耗 = EXCLUDED.总积分消耗,
    总积分消耗次数 = EXCLUDED.总积分消耗次数,
    更新时间 = NOW();
  
  -- 记录调试信息
  RAISE NOTICE '日报生成完成 - 日期: %, 总用户: %, 新增用户: %, 总付费用户: %, 新增付费用户: %', 
    report_date, v_total_users, v_new_users, v_total_paid_users, v_new_paid_users;
  RAISE NOTICE '兑换数据 - 新增兑换次数: %, 新增兑换积分: %, 总兑换次数: %, 总兑换积分: %',
    v_new_redeem_count, v_new_redeem_points, v_total_redeem_count, v_total_redeem_points;
  RAISE NOTICE '消耗数据 - 新增消耗: %, 新增消耗次数: %, 总消耗: %, 总消耗次数: %',
    v_new_consumption, v_new_consumption_count, v_total_consumption, v_total_consumption_count;
  
  RETURN TRUE;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION '生成日报失败: %', SQLERRM;
    RETURN FALSE;
END;
$$;

-- 添加函数注释
COMMENT ON FUNCTION public.generate_daily_report(DATE) IS '生成指定日期的项目日报数据，默认为昨天';

-- 创建手动触发日报生成的函数（管理员专用）
CREATE OR REPLACE FUNCTION public.manual_generate_daily_report(report_date DATE DEFAULT CURRENT_DATE - INTERVAL '1 day')
RETURNS TABLE (
  success BOOLEAN,
  message TEXT,
  report_date_generated DATE
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
    RETURN QUERY SELECT FALSE, '权限不足：只有管理员可以手动生成日报'::TEXT, NULL::DATE;
    RETURN;
  END IF;
  
  -- 生成日报
  IF public.generate_daily_report(report_date) THEN
    RETURN QUERY SELECT TRUE, '日报生成成功'::TEXT, report_date;
  ELSE
    RETURN QUERY SELECT FALSE, '日报生成失败'::TEXT, report_date;
  END IF;
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN QUERY SELECT FALSE, ('日报生成异常: ' || SQLERRM)::TEXT, report_date;
END;
$$;

-- 添加函数注释
COMMENT ON FUNCTION public.manual_generate_daily_report(DATE) IS '手动生成日报（管理员专用）';