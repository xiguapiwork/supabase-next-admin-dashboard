-- 简化的小数积分系统测试

-- 1. 测试创建小数积分的兑换卡
SELECT batch_create_exchange_cards('测试小数积分卡', 15.50, '测试小数积分功能', 1) as created_cards;

-- 2. 查看创建的兑换卡（验证小数积分存储）
SELECT 卡号, 卡片名称, 积分数量, 备注 FROM public."exchange-cards" WHERE 卡片名称 = '测试小数积分卡';

-- 3. 测试应用配置的小数积分
INSERT INTO public.app_config (配置名称, 配置类型, 积分消耗, 排序顺序, 备注)
VALUES ('test_decimal_function', 'function', 2.75, 1, '测试小数积分配置');

-- 4. 查看应用配置（验证小数积分存储）
SELECT 配置名称, 配置类型, 积分消耗, 备注 FROM public.app_config WHERE 配置名称 = 'test_decimal_function';

-- 5. 检查用户管理表的积分字段类型
SELECT column_name, data_type, numeric_precision, numeric_scale 
FROM information_schema.columns 
WHERE table_name = 'user-management' AND column_name = 'points';

-- 6. 检查积分日志表的积分字段类型
SELECT column_name, data_type, numeric_precision, numeric_scale 
FROM information_schema.columns 
WHERE table_name = 'points_log' AND column_name IN ('变动前积分', '积分变动量', '变动后积分');

-- 7. 检查兑换卡表的积分字段类型
SELECT column_name, data_type, numeric_precision, numeric_scale 
FROM information_schema.columns 
WHERE table_name = 'exchange-cards' AND column_name = '积分数量';