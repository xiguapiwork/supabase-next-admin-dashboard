-- 启用 pg_cron 扩展
-- 注意：这个迁移文件需要在所有其他迁移之前执行

-- 首先在 postgres 数据库中创建扩展
-- 这是 pg_cron 的要求，因为它需要在 postgres 数据库中运行
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;

-- 设置 cron 数据库名称为当前数据库
-- 这允许 pg_cron 在当前数据库中调度任务
SELECT cron.schedule_in_database(
  'test-connection',
  '* * * * *',
  'SELECT 1;',
  current_database()
);

-- 立即取消测试任务
SELECT cron.unschedule('test-connection');

-- 添加注释
COMMENT ON EXTENSION pg_cron IS '启用 PostgreSQL 定时任务扩展';