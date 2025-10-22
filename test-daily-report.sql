-- 日报系统测试脚本
-- 用于验证日报功能是否正常工作

-- 1. 测试手动生成日报（生成昨天的日报）
SELECT '=== 测试手动生成日报 ===' as test_step;

-- 生成昨天的日报
SELECT public.manual_generate_daily_report(CURRENT_DATE - INTERVAL '1 day') as manual_report_result;

-- 2. 查看生成的日报数据
SELECT '=== 查看生成的日报数据 ===' as test_step;

-- 查询最近的日报记录
SELECT 
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
  创建时间
FROM public."daily_reports"
ORDER BY 日期 DESC
LIMIT 5;

-- 3. 测试定时任务状态查询
SELECT '=== 测试定时任务状态查询 ===' as test_step;

-- 查询定时任务状态（需要管理员权限）
SELECT * FROM public.get_daily_report_job_status();

-- 4. 测试数据查询函数
SELECT '=== 测试数据查询函数 ===' as test_step;

-- 查询最近7天的日报数据（需要管理员权限）
SELECT * FROM public.get_daily_reports(
  CURRENT_DATE - INTERVAL '7 days',
  CURRENT_DATE,
  10,
  0
);

-- 5. 验证表结构
SELECT '=== 验证表结构 ===' as test_step;

-- 查看daily_reports表的结构
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'daily_reports'
ORDER BY ordinal_position;

-- 6. 验证索引
SELECT '=== 验证索引 ===' as test_step;

-- 查看daily_reports表的索引
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'daily_reports'
  AND schemaname = 'public';

-- 7. 验证RLS策略
SELECT '=== 验证RLS策略 ===' as test_step;

-- 查看daily_reports表的RLS策略
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'daily_reports'
  AND schemaname = 'public';

-- 8. 测试重复生成日报（应该更新而不是插入新记录）
SELECT '=== 测试重复生成日报 ===' as test_step;

-- 再次生成昨天的日报，应该更新现有记录
SELECT public.manual_generate_daily_report(CURRENT_DATE - INTERVAL '1 day') as duplicate_report_result;

-- 验证记录数量没有增加
SELECT 
  COUNT(*) as total_reports,
  MAX(日期) as latest_date,
  MIN(日期) as earliest_date
FROM public."daily_reports";

-- 9. 测试边界情况
SELECT '=== 测试边界情况 ===' as test_step;

-- 尝试生成未来日期的日报（应该失败或返回空数据）
SELECT public.manual_generate_daily_report(CURRENT_DATE + INTERVAL '1 day') as future_date_result;

-- 10. 查看函数定义
SELECT '=== 查看函数定义 ===' as test_step;

-- 查看所有相关函数
SELECT 
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%daily_report%'
ORDER BY routine_name;

-- 测试完成提示
SELECT '=== 日报系统测试完成 ===' as test_complete;