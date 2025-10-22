-- 插入测试积分卡数据
-- 注意：这些数据仅用于测试图表功能

-- 插入一些过去几天的积分卡数据
INSERT INTO public."exchange-cards" (卡号, 卡片名称, 积分数量, 备注, 状态, 创建时间, 兑换时间) VALUES
-- 7天前的数据
('TEST001', '测试卡片1', 100, '测试用途', false, NOW() - INTERVAL '7 days', NULL),
('TEST002', '测试卡片2', 200, '测试用途', true, NOW() - INTERVAL '7 days', NOW() - INTERVAL '6 days'),
('TEST003', '测试卡片3', 150, '测试用途', false, NOW() - INTERVAL '7 days', NULL),

-- 6天前的数据
('TEST004', '测试卡片4', 300, '测试用途', true, NOW() - INTERVAL '6 days', NOW() - INTERVAL '5 days'),
('TEST005', '测试卡片5', 250, '测试用途', false, NOW() - INTERVAL '6 days', NULL),

-- 5天前的数据
('TEST006', '测试卡片6', 180, '测试用途', true, NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days'),
('TEST007', '测试卡片7', 120, '测试用途', false, NOW() - INTERVAL '5 days', NULL),
('TEST008', '测试卡片8', 220, '测试用途', true, NOW() - INTERVAL '5 days', NOW() - INTERVAL '3 days'),

-- 4天前的数据
('TEST009', '测试卡片9', 160, '测试用途', false, NOW() - INTERVAL '4 days', NULL),
('TEST010', '测试卡片10', 280, '测试用途', true, NOW() - INTERVAL '4 days', NOW() - INTERVAL '2 days'),

-- 3天前的数据
('TEST011', '测试卡片11', 190, '测试用途', false, NOW() - INTERVAL '3 days', NULL),
('TEST012', '测试卡片12', 240, '测试用途', true, NOW() - INTERVAL '3 days', NOW() - INTERVAL '1 day'),

-- 2天前的数据
('TEST013', '测试卡片13', 170, '测试用途', false, NOW() - INTERVAL '2 days', NULL),
('TEST014', '测试卡片14', 210, '测试用途', true, NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day'),

-- 1天前的数据
('TEST015', '测试卡片15', 130, '测试用途', false, NOW() - INTERVAL '1 day', NULL),
('TEST016', '测试卡片16', 260, '测试用途', true, NOW() - INTERVAL '1 day', NOW()),

-- 今天的数据
('TEST017', '测试卡片17', 140, '测试用途', false, NOW(), NULL),
('TEST018', '测试卡片18', 200, '测试用途', true, NOW(), NOW());