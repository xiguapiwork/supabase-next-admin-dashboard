-- 修复兑换时间字段的默认值问题
-- 兑换时间应该在创建时为 NULL，只有在兑换时才设置时间

-- 移除兑换时间字段的默认值
ALTER TABLE "exchange-cards" ALTER COLUMN "兑换时间" DROP DEFAULT;

-- 确保现有未兑换卡片的兑换时间为 NULL
-- 只更新状态为 true（未兑换）且兑换时间不为 NULL 的记录
UPDATE "exchange-cards" 
SET "兑换时间" = NULL 
WHERE "状态" = true AND "兑换时间" IS NOT NULL;

-- 添加注释说明
COMMENT ON COLUMN "exchange-cards"."兑换时间" IS '兑换时间，创建时为NULL，只有在兑换时才设置';