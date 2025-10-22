-- 创建积分统计函数
-- 用于获取系统中所有用户的积分使用情况统计

CREATE OR REPLACE FUNCTION public.get_points_statistics()
RETURNS TABLE (
  total_redeem_points BIGINT,
  total_usage_points BIGINT,
  usage_rate NUMERIC(5,2),
  total_users INTEGER,
  active_users INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    -- 总兑换积分（所有用户的兑换积分总和）
    COALESCE(SUM(um.total_redeem), 0)::BIGINT as total_redeem_points,
    
    -- 总使用积分（所有用户的使用积分总和）
    COALESCE(SUM(um.total_usage), 0)::BIGINT as total_usage_points,
    
    -- 使用率（已使用积分 / 总兑换积分 * 100）
    CASE 
      WHEN COALESCE(SUM(um.total_redeem), 0) = 0 THEN 0::NUMERIC(5,2)
      ELSE ROUND(
        (COALESCE(SUM(um.total_usage), 0)::NUMERIC / COALESCE(SUM(um.total_redeem), 1)::NUMERIC) * 100, 
        2
      )
    END as usage_rate,
    
    -- 总用户数
    COUNT(*)::INTEGER as total_users,
    
    -- 活跃用户数（有积分使用记录的用户）
    COUNT(CASE WHEN um.total_usage > 0 THEN 1 END)::INTEGER as active_users
    
  FROM public."user-management" um;
END;
$$;

-- 添加函数注释
COMMENT ON FUNCTION public.get_points_statistics() IS '获取系统积分统计信息：总兑换积分、总使用积分、使用率、用户数等';

-- 为管理员角色授予执行权限
GRANT EXECUTE ON FUNCTION public.get_points_statistics() TO authenticated;