-- 为用户管理表添加兑换卡兑换次数列
-- 用于跟踪用户兑换卡的使用次数

-- 添加 redeem_count 列（兑换卡兑换次数）
ALTER TABLE public."user-management" 
ADD COLUMN redeem_count INTEGER NOT NULL DEFAULT 0 CHECK (redeem_count >= 0);

-- 添加列注释
COMMENT ON COLUMN public."user-management".redeem_count IS '用户兑换卡兑换次数：记录用户累计使用兑换卡的次数';

-- 创建索引以提高查询性能
CREATE INDEX idx_user_management_redeem_count ON public."user-management"(redeem_count);

-- 创建或替换函数来更新用户的兑换次数
CREATE OR REPLACE FUNCTION public.update_user_redeem_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- 当兑换卡状态变为已兑换时，更新用户的兑换次数
  IF NEW.状态 = false AND OLD.状态 = true THEN
    UPDATE public."user-management"
    SET redeem_count = redeem_count + 1
    WHERE id = NEW.兑换人;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 创建触发器，当兑换卡状态更新时自动更新用户兑换次数
DROP TRIGGER IF EXISTS trigger_update_redeem_count ON public."exchange-cards";
CREATE TRIGGER trigger_update_redeem_count
  AFTER UPDATE ON public."exchange-cards"
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_redeem_count();

-- 初始化现有用户的兑换次数（基于已兑换的卡片数量）
UPDATE public."user-management" 
SET redeem_count = (
  SELECT COUNT(*)
  FROM public."exchange-cards"
  WHERE 兑换人 = public."user-management".id
    AND 状态 = false
);