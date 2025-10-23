-- 测试兑换历史功能的脚本
-- 为测试用户兑换积分卡，生成 card_redeem 类型的积分日志记录

-- 首先创建一个测试用户（如果不存在）
DO $$
DECLARE
    test_user_id UUID := '12345678-1234-1234-1234-123456789012';
    test_username TEXT := 'test_user';
BEGIN
    -- 检查用户是否已存在
    IF NOT EXISTS (SELECT 1 FROM public."user-management" WHERE id = test_user_id) THEN
        -- 插入测试用户
        INSERT INTO public."user-management" (id, username, avatar, points, role)
        VALUES (
            test_user_id,
            test_username,
            'https://api.dicebear.com/7.x/avataaars/svg?seed=' || test_username,
            0,
            'user'
        );
        
        RAISE NOTICE '创建测试用户: %', test_user_id;
    ELSE
        RAISE NOTICE '测试用户已存在: %', test_user_id;
    END IF;
END $$;

-- 创建一张可兑换的测试积分卡
INSERT INTO public."exchange-cards" (卡号, 卡片名称, 积分数量, 备注, 状态, 创建时间)
VALUES ('TESTCARD001', '测试兑换卡', 500, '用于测试兑换历史功能', true, NOW())
ON CONFLICT (卡号) DO NOTHING;

-- 为测试用户兑换这张积分卡
SELECT public.redeem_card('TESTCARD001', '12345678-1234-1234-1234-123456789012'::UUID) AS redeem_result;

-- 查询结果验证
SELECT 
    '积分日志记录:' AS type,
    用户ID,
    积分变动量,
    变动类型,
    变动原因,
    兑换卡卡号,
    创建时间
FROM public."points_log" 
WHERE 用户ID = '12345678-1234-1234-1234-123456789012'::UUID 
    AND 变动类型 = 'card_redeem'
ORDER BY 创建时间 DESC;

SELECT 
    '用户积分:' AS type,
    username,
    points,
    total_redeem
FROM public."user-management" 
WHERE id = '12345678-1234-1234-1234-123456789012'::UUID;

SELECT 
    '积分卡状态:' AS type,
    卡号,
    卡片名称,
    积分数量,
    状态,
    兑换人,
    兑换时间
FROM public."exchange-cards" 
WHERE 卡号 = 'TESTCARD001';