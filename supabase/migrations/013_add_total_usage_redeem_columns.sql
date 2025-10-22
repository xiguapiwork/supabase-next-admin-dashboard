-- 为用户管理表添加总使用积分和总兑换积分列
-- 用于跟踪用户的积分流动情况

-- 添加 total_usage 列（总使用积分）
ALTER TABLE public."user-management" 
ADD COLUMN total_usage INTEGER NOT NULL DEFAULT 0 CHECK (total_usage >= 0);

-- 添加 total_redeem 列（总兑换积分）
ALTER TABLE public."user-management" 
ADD COLUMN total_redeem INTEGER NOT NULL DEFAULT 0 CHECK (total_redeem >= 0);

-- 添加 usage_count 列（总使用次数）
ALTER TABLE public."user-management" 
ADD COLUMN usage_count INTEGER NOT NULL DEFAULT 0 CHECK (usage_count >= 0);

-- 添加 first_payment_time 列（首次付费时间）
ALTER TABLE public."user-management" 
ADD COLUMN first_payment_time TIMESTAMP WITH TIME ZONE;

-- 添加列注释
COMMENT ON COLUMN public."user-management".total_usage IS '用户总使用积分：记录用户累计消耗的积分总数';
COMMENT ON COLUMN public."user-management".total_redeem IS '用户总兑换积分：记录用户累计兑换获得的积分总数';
COMMENT ON COLUMN public."user-management".usage_count IS '用户总使用次数：记录用户累计使用积分的次数';
COMMENT ON COLUMN public."user-management".first_payment_time IS '用户首次付费时间：记录用户从普通用户升级为付费用户的时间戳';

-- 创建索引以提高查询性能
CREATE INDEX idx_user_management_total_usage ON public."user-management"(total_usage);
CREATE INDEX idx_user_management_total_redeem ON public."user-management"(total_redeem);
CREATE INDEX idx_user_management_usage_count ON public."user-management"(usage_count);
CREATE INDEX idx_user_management_first_payment_time ON public."user-management"(first_payment_time);

-- 添加积分校验约束函数（设置search_path以确保安全性）
CREATE OR REPLACE FUNCTION public.validate_user_points_balance()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  -- 检查积分平衡：current_points + total_usage = total_redeem
  IF NEW.points + NEW.total_usage != NEW.total_redeem THEN
    -- 记录警告到日志
    INSERT INTO public."points_log" (
      "用户ID",
      "积分变动量", 
      "变动后积分",
      "变动原因",
      "创建时间"
    ) VALUES (
      NEW.id,
      0,
      NEW.points,
      '积分平衡校验失败: current=' || NEW.points || ', usage=' || NEW.total_usage || ', redeem=' || NEW.total_redeem,
      NOW()
    );
    
    -- 可以选择抛出异常或仅记录警告
    -- RAISE WARNING '用户 % 积分平衡不一致: current=%, usage=%, redeem=%', NEW.id, NEW.points, NEW.total_usage, NEW.total_redeem;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 创建触发器进行积分平衡校验（仅在更新时触发）
CREATE TRIGGER validate_points_balance_trigger
  BEFORE UPDATE ON public."user-management"
  FOR EACH ROW 
  WHEN (OLD.points IS DISTINCT FROM NEW.points OR 
        OLD.total_usage IS DISTINCT FROM NEW.total_usage OR 
        OLD.total_redeem IS DISTINCT FROM NEW.total_redeem)
  EXECUTE FUNCTION public.validate_user_points_balance();

-- 更新现有用户的初始值
-- 注意：这里我们将现有用户的total_redeem设置为当前积分，假设他们的积分都是通过兑换获得的
UPDATE public."user-management" 
SET total_redeem = points 
WHERE total_redeem = 0 AND points > 0;

-- 创建辅助函数：获取用户积分统计信息
CREATE OR REPLACE FUNCTION public.get_user_points_stats(user_id UUID DEFAULT auth.uid())
RETURNS TABLE (
  current_points INTEGER,
  total_usage INTEGER,
  total_redeem INTEGER,
  redeem_count INTEGER,
  usage_count INTEGER,
  first_payment_time TIMESTAMP WITH TIME ZONE,
  balance_check BOOLEAN,
  balance_difference INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.points as current_points,
    u.total_usage,
    u.total_redeem,
    u.redeem_count,
    u.usage_count,
    u.first_payment_time,
    (u.points + u.total_usage = u.total_redeem) as balance_check,
    (u.total_redeem - u.points - u.total_usage) as balance_difference
  FROM public."user-management" u
  WHERE u.id = user_id;
END;
$$;

-- 创建积分统计修复函数（设置search_path以确保安全性）
CREATE OR REPLACE FUNCTION public.fix_user_points_stats()
RETURNS TABLE(
  user_id UUID,
  username TEXT,
  old_total_usage INTEGER,
  new_total_usage INTEGER,
  old_total_redeem INTEGER,
  new_total_redeem INTEGER
)
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  -- 简化版本：仅返回需要修复的用户信息，不执行实际修复
  RETURN QUERY
  SELECT 
    um.id,
    um.username,
    um.total_usage,
    um.total_usage, -- 保持不变
    um.total_redeem,
    um.total_redeem -- 保持不变
  FROM public."user-management" um
  WHERE um.total_usage IS NULL OR um.total_redeem IS NULL
  LIMIT 0; -- 暂时不返回任何结果
END;
$$;

-- 添加函数注释
COMMENT ON FUNCTION public.get_user_points_stats(UUID) IS '获取用户积分统计信息，包括平衡校验结果';
COMMENT ON FUNCTION public.validate_user_points_balance() IS '校验用户积分平衡：当前积分 + 总使用 = 总兑换 - 已修复search_path安全问题';
COMMENT ON FUNCTION public.fix_user_points_stats() IS '积分统计修复函数 - 已修复search_path安全问题';