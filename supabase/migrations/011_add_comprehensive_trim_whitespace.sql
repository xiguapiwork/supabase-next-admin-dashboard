-- 为所有主要表添加自动清理首尾空格的功能
-- 包含：app_config、apikeys、common_variables 表
-- 防止用户在输入时不小心添加的首尾空格影响功能调用
-- 创建时间: 2024-12-21

-- ========================================
-- 1. app_config 表空格清理功能
-- ========================================

-- 创建 app_config 表空格清理触发器函数
CREATE OR REPLACE FUNCTION public.trim_app_config_whitespace()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  -- 清理 配置名称 字段的首尾空格（保留中间空格）
  IF NEW.配置名称 IS NOT NULL THEN
    NEW.配置名称 = TRIM(NEW.配置名称);
  END IF;
  
  -- 清理 备注 字段的首尾空格（保留中间空格）
  IF NEW.备注 IS NOT NULL THEN
    NEW.备注 = TRIM(NEW.备注);
  END IF;
  
  RETURN NEW;
END;
$$;

-- 为 app_config 表创建 INSERT 触发器
CREATE TRIGGER trim_app_config_whitespace_on_insert
  BEFORE INSERT ON public.app_config
  FOR EACH ROW
  EXECUTE FUNCTION public.trim_app_config_whitespace();

-- 为 app_config 表创建 UPDATE 触发器
CREATE TRIGGER trim_app_config_whitespace_on_update
  BEFORE UPDATE ON public.app_config
  FOR EACH ROW
  EXECUTE FUNCTION public.trim_app_config_whitespace();

-- 清理 app_config 表现有数据中的首尾空格（一次性操作）
UPDATE public.app_config 
SET 
  配置名称 = TRIM(配置名称),
  备注 = TRIM(备注)
WHERE 
  配置名称 != TRIM(配置名称) 
  OR (备注 IS NOT NULL AND 备注 != TRIM(备注));

-- ========================================
-- 2. apikeys 表空格清理功能
-- ========================================

-- 创建 API Keys 空格清理触发器函数
CREATE OR REPLACE FUNCTION public.trim_apikeys_whitespace()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  -- 清理 API Key 名称的前后空格
  IF NEW.名称 IS NOT NULL THEN
    NEW.名称 = TRIM(NEW.名称);
  END IF;
  
  -- 清理 API Key 值的前后空格
  IF NEW.key IS NOT NULL THEN
    NEW.key = TRIM(NEW.key);
  END IF;
  
  RETURN NEW;
END;
$$;

-- 为 apikeys 表创建触发器
CREATE TRIGGER trigger_trim_apikeys_whitespace
  BEFORE INSERT OR UPDATE ON public."apikeys"
  FOR EACH ROW
  EXECUTE FUNCTION public.trim_apikeys_whitespace();

-- 一次性清理 apikeys 表现有数据中的空格
UPDATE public."apikeys" 
SET 
  名称 = TRIM(名称),
  key = TRIM(key),
  更新时间 = NOW()
WHERE 
  名称 != TRIM(名称) OR 
  key != TRIM(key);

-- ========================================
-- 3. common_variables 表空格清理功能
-- ========================================

-- 创建常用变量空格清理触发器函数
CREATE OR REPLACE FUNCTION public.trim_common_variables_whitespace()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  -- 清理变量名的前后空格
  IF NEW.变量名 IS NOT NULL THEN
    NEW.变量名 = TRIM(NEW.变量名);
  END IF;
  
  -- 清理变量值的前后空格
  IF NEW.变量值 IS NOT NULL THEN
    NEW.变量值 = TRIM(NEW.变量值);
  END IF;
  
  RETURN NEW;
END;
$$;

-- 为 common_variables 表创建触发器
CREATE TRIGGER trigger_trim_common_variables_whitespace
  BEFORE INSERT OR UPDATE ON public."common_variables"
  FOR EACH ROW
  EXECUTE FUNCTION public.trim_common_variables_whitespace();

-- 一次性清理 common_variables 表现有数据中的空格
UPDATE public."common_variables" 
SET 
  变量名 = TRIM(变量名),
  变量值 = TRIM(变量值),
  更新时间 = NOW()
WHERE 
  变量名 != TRIM(变量名) OR 
  变量值 != TRIM(变量值);

-- ========================================
-- 4. 添加注释说明
-- ========================================

-- app_config 表注释
COMMENT ON FUNCTION public.trim_app_config_whitespace() IS '自动清理 app_config 表中文本字段的首尾空格，防止用户输入时的意外空格影响功能调用';
COMMENT ON TRIGGER trim_app_config_whitespace_on_insert ON public.app_config IS '在插入数据时自动清理首尾空格';
COMMENT ON TRIGGER trim_app_config_whitespace_on_update ON public.app_config IS '在更新数据时自动清理首尾空格';

-- apikeys 表注释
COMMENT ON FUNCTION public.trim_apikeys_whitespace() IS '自动清理 API Keys 表中名称和key字段的前后空格';
COMMENT ON TRIGGER trigger_trim_apikeys_whitespace ON public."apikeys" IS '在插入或更新时自动清理空格';

-- common_variables 表注释
COMMENT ON FUNCTION public.trim_common_variables_whitespace() IS '自动清理常用变量表中变量名和变量值字段的前后空格';
COMMENT ON TRIGGER trigger_trim_common_variables_whitespace ON public."common_variables" IS '在插入或更新时自动清理空格';