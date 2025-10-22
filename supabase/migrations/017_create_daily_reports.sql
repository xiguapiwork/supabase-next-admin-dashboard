-- 创建项目日报表
-- 用于记录每日的项目统计数据，避免因删除日志导致的历史数据丢失

CREATE TABLE public."daily_reports" (
  报告ID UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- 1. 日期（昨天的日期）
  日期 DATE NOT NULL UNIQUE,
  
  -- 2. 总用户数（截止到昨天的总用户数）
  总用户数 INTEGER NOT NULL DEFAULT 0,
  
  -- 3. 总付费用户数（截止到昨天的总付费用户数）
  总付费用户数 INTEGER NOT NULL DEFAULT 0,
  
  -- 4. 新增用户数（昨天注册的用户总数）
  新增用户数 INTEGER NOT NULL DEFAULT 0,
  
  -- 5. 新增付费用户数（昨天积分日志变动原因中新用户兑换的数量）
  新增付费用户数 INTEGER NOT NULL DEFAULT 0,
  
  -- 6. 新增付费用户的兑换积分（昨天积分日志变动原因中新用户兑换的对应积分总和）
  新增付费用户兑换积分 INTEGER NOT NULL DEFAULT 0,
  
  -- 7. 新增兑换卡片数量（昨日变动类型中是card_redeem兑换的总次数）
  新增兑换卡片数量 INTEGER NOT NULL DEFAULT 0,
  
  -- 8. 新增兑换卡片积分（昨日变动类型中是card_redeem兑换的总积分）
  新增兑换卡片积分 INTEGER NOT NULL DEFAULT 0,
  
  -- 9. 总兑换卡片数量（前天的总兑换卡数量加上新增兑换卡片数量）
  总兑换卡片数量 INTEGER NOT NULL DEFAULT 0,
  
  -- 10. 总兑换卡片积分（前天的总兑换卡积分加上新增兑换卡片积分）
  总兑换卡片积分 INTEGER NOT NULL DEFAULT 0,
  
  -- 11. 新增积分消耗（所有昨天扣分的积分总和）
  新增积分消耗 INTEGER NOT NULL DEFAULT 0,
  
  -- 12. 新增扣分消耗次数（所有昨天扣分的积分次数总和）
  新增扣分消耗次数 INTEGER NOT NULL DEFAULT 0,
  
  -- 13. 总积分消耗（前天的总积分消耗加上新增积分消耗）
  总积分消耗 INTEGER NOT NULL DEFAULT 0,
  
  -- 14. 总积分消耗次数（前天的总积分消耗次数加上新增积分消耗次数）
  总积分消耗次数 INTEGER NOT NULL DEFAULT 0,
  
  -- 创建时间
  创建时间 TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 更新时间
  更新时间 TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引提高查询性能
CREATE INDEX idx_daily_reports_date ON public."daily_reports"(日期);
CREATE INDEX idx_daily_reports_created_at ON public."daily_reports"(创建时间);

-- 启用RLS
ALTER TABLE public."daily_reports" ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略：只有管理员可以查看和操作日报数据
CREATE POLICY "管理员可以查看所有日报数据" ON public."daily_reports"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public."user-management" 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "管理员可以插入日报数据" ON public."daily_reports"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public."user-management" 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "管理员可以更新日报数据" ON public."daily_reports"
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public."user-management" 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 添加表注释
COMMENT ON TABLE public."daily_reports" IS '项目日报表：记录每日的项目统计数据，用于历史数据归档';
COMMENT ON COLUMN public."daily_reports".日期 IS '报告日期（昨天的日期）';
COMMENT ON COLUMN public."daily_reports".总用户数 IS '截止到报告日期的总用户数';
COMMENT ON COLUMN public."daily_reports".总付费用户数 IS '截止到报告日期的总付费用户数';
COMMENT ON COLUMN public."daily_reports".新增用户数 IS '报告日期当天注册的用户总数';
COMMENT ON COLUMN public."daily_reports".新增付费用户数 IS '报告日期当天积分日志变动原因中新用户兑换的数量';
COMMENT ON COLUMN public."daily_reports".新增付费用户兑换积分 IS '报告日期当天积分日志变动原因中新用户兑换的对应积分总和';
COMMENT ON COLUMN public."daily_reports".新增兑换卡片数量 IS '报告日期当天变动类型中是card_redeem兑换的总次数';
COMMENT ON COLUMN public."daily_reports".新增兑换卡片积分 IS '报告日期当天变动类型中是card_redeem兑换的总积分';
COMMENT ON COLUMN public."daily_reports".总兑换卡片数量 IS '截止到报告日期的总兑换卡片数量';
COMMENT ON COLUMN public."daily_reports".总兑换卡片积分 IS '截止到报告日期的总兑换卡片积分';
COMMENT ON COLUMN public."daily_reports".新增积分消耗 IS '报告日期当天所有扣分的积分总和';
COMMENT ON COLUMN public."daily_reports".新增扣分消耗次数 IS '报告日期当天所有扣分的积分次数总和';
COMMENT ON COLUMN public."daily_reports".总积分消耗 IS '截止到报告日期的总积分消耗';
COMMENT ON COLUMN public."daily_reports".总积分消耗次数 IS '截止到报告日期的总积分消耗次数';