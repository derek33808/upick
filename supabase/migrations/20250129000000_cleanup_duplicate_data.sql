/*
  # 清理重复数据脚本
  
  这个脚本将清理数据库中的重复数据，包括：
  1. 重复的超市数据
  2. 重复的商品数据（保留价格最低的）
  3. 添加唯一约束防止未来重复
  
  注意：运行前请备份数据库！
*/

-- 开始事务
BEGIN;

-- 禁用外键约束检查
SET session_replication_role = replica;

-- 1. 清理重复的超市数据
-- ================================

-- 创建临时表来存储去重后的超市数据
CREATE TEMP TABLE temp_unique_supermarkets AS
SELECT DISTINCT ON (name_en, location)
  id,
  name_en,
  name_zh,
  location,
  logo_url,
  latitude,
  longitude,
  phone,
  hours,
  rating,
  created_at,
  updated_at
FROM supermarkets
ORDER BY name_en, location, id; -- 保留ID最小的记录

-- 显示将要删除的重复超市
WITH duplicates AS (
  SELECT name_en, location, COUNT(*) as count
  FROM supermarkets
  GROUP BY name_en, location
  HAVING COUNT(*) > 1
)
SELECT 
  s.id,
  s.name_en,
  s.location,
  d.count as total_duplicates
FROM supermarkets s
JOIN duplicates d ON s.name_en = d.name_en AND s.location = d.location
WHERE s.id NOT IN (SELECT id FROM temp_unique_supermarkets)
ORDER BY s.name_en, s.location;

-- 记录将要删除的超市数量
SELECT 
  COUNT(*) as supermarkets_to_delete,
  (SELECT COUNT(*) FROM supermarkets) as total_supermarkets,
  (SELECT COUNT(*) FROM temp_unique_supermarkets) as unique_supermarkets
FROM supermarkets s
WHERE s.id NOT IN (SELECT id FROM temp_unique_supermarkets);

-- 2. 清理重复的商品数据
-- ================================

-- 创建函数来清理商品名称（移除Store后缀）
CREATE OR REPLACE FUNCTION clean_product_name(product_name TEXT)
RETURNS TEXT AS $$
BEGIN
  -- 移除类似 "(Store 2)", "(Store 10)" 等后缀
  RETURN TRIM(REGEXP_REPLACE(product_name, '\s*\(Store\s+\d+\)\s*$', '', 'i'));
END;
$$ LANGUAGE plpgsql;

-- 显示重复商品分析
WITH cleaned_products AS (
  SELECT 
    id,
    name_en,
    clean_product_name(name_en) as cleaned_name,
    name_zh,
    price,
    supermarket_id,
    category,
    image_url,
    original_price,
    unit,
    origin,
    freshness,
    rating,
    is_special,
    special_end_date,
    discount_percentage,
    created_at,
    updated_at
  FROM products
),
duplicate_analysis AS (
  SELECT 
    cleaned_name,
    category,
    COUNT(*) as duplicate_count,
    MIN(price) as min_price,
    MAX(price) as max_price,
    AVG(price) as avg_price
  FROM cleaned_products
  GROUP BY cleaned_name, category
  HAVING COUNT(*) > 1
)
SELECT 
  cleaned_name,
  category,
  duplicate_count,
  min_price,
  max_price,
  ROUND(avg_price::numeric, 2) as avg_price
FROM duplicate_analysis
ORDER BY duplicate_count DESC, cleaned_name;

-- 创建临时表来存储去重后的商品数据（保留每个商品的最低价格记录）
CREATE TEMP TABLE temp_unique_products AS
WITH cleaned_products AS (
  SELECT 
    id,
    name_en,
    clean_product_name(name_en) as cleaned_name,
    name_zh,
    price,
    supermarket_id,
    category,
    image_url,
    original_price,
    unit,
    origin,
    freshness,
    rating,
    is_special,
    special_end_date,
    discount_percentage,
    created_at,
    updated_at,
    ROW_NUMBER() OVER (
      PARTITION BY clean_product_name(name_en), category 
      ORDER BY price ASC, id ASC
    ) as rn
  FROM products
)
SELECT 
  id,
  cleaned_name as name_en,  -- 使用清理后的名称
  name_zh,
  price,
  supermarket_id,
  category,
  image_url,
  original_price,
  unit,
  origin,
  freshness,
  rating,
  is_special,
  special_end_date,
  discount_percentage,
  created_at,
  updated_at
FROM cleaned_products
WHERE rn = 1;  -- 只保留最低价格的记录

-- 显示将要删除的重复商品
SELECT 
  COUNT(*) as products_to_delete,
  (SELECT COUNT(*) FROM products) as total_products,
  (SELECT COUNT(*) FROM temp_unique_products) as unique_products
FROM products p
WHERE p.id NOT IN (SELECT id FROM temp_unique_products);

-- 3. 执行清理操作
-- ================================

-- 备份将要删除的数据到备份表
CREATE TABLE IF NOT EXISTS deleted_supermarkets_backup AS
SELECT *, NOW() as deleted_at
FROM supermarkets
WHERE id NOT IN (SELECT id FROM temp_unique_supermarkets);

CREATE TABLE IF NOT EXISTS deleted_products_backup AS
SELECT *, NOW() as deleted_at
FROM products
WHERE id NOT IN (SELECT id FROM temp_unique_products);

-- 删除依赖数据（从products表中删除引用了重复超市的商品）
DELETE FROM products 
WHERE supermarket_id NOT IN (SELECT id FROM temp_unique_supermarkets);

-- 删除重复的超市数据
DELETE FROM supermarkets 
WHERE id NOT IN (SELECT id FROM temp_unique_supermarkets);

-- 删除重复的商品数据
DELETE FROM products 
WHERE id NOT IN (SELECT id FROM temp_unique_products);

-- 更新products表的名称为清理后的名称
UPDATE products 
SET name_en = tup.name_en
FROM temp_unique_products tup
WHERE products.id = tup.id
AND products.name_en != tup.name_en;

-- 4. 添加唯一约束防止未来重复
-- ================================

-- 为超市添加唯一约束
ALTER TABLE supermarkets 
ADD CONSTRAINT unique_supermarket_name_location 
UNIQUE (name_en, location);

-- 为商品添加唯一约束（同一超市不能有同名同类别的商品）
ALTER TABLE products 
ADD CONSTRAINT unique_product_per_supermarket 
UNIQUE (name_en, category, supermarket_id);

-- 创建函数触发器，自动清理新插入的商品名称
CREATE OR REPLACE FUNCTION clean_product_name_trigger()
RETURNS TRIGGER AS $$
BEGIN
  NEW.name_en := clean_product_name(NEW.name_en);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
DROP TRIGGER IF EXISTS clean_product_name_before_insert ON products;
CREATE TRIGGER clean_product_name_before_insert
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION clean_product_name_trigger();

-- 5. 重建索引提高性能
-- ================================

-- 删除可能存在的旧索引
DROP INDEX IF EXISTS idx_products_name_category;
DROP INDEX IF EXISTS idx_products_supermarket_category;
DROP INDEX IF EXISTS idx_supermarkets_name_location;

-- 创建新的优化索引
CREATE INDEX idx_products_name_category ON products(name_en, category);
CREATE INDEX idx_products_supermarket_category ON products(supermarket_id, category);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_supermarkets_name_location ON supermarkets(name_en, location);
CREATE INDEX idx_supermarkets_coordinates ON supermarkets(latitude, longitude);

-- 6. 更新序列值
-- ================================

-- 更新序列值确保新记录ID不冲突
SELECT setval('supermarkets_id_seq', (SELECT MAX(id) FROM supermarkets));
SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));

-- 7. 数据验证和统计
-- ================================

-- 验证清理结果
WITH duplicate_check AS (
  SELECT name_en, location, COUNT(*) as count
  FROM supermarkets
  GROUP BY name_en, location
  HAVING COUNT(*) > 1
)
SELECT 
  CASE WHEN COUNT(*) = 0 
    THEN '✅ 超市数据去重成功 - 无重复记录' 
    ELSE '❌ 仍有重复超市数据' 
  END as supermarket_dedup_status
FROM duplicate_check;

WITH product_duplicate_check AS (
  SELECT name_en, category, supermarket_id, COUNT(*) as count
  FROM products
  GROUP BY name_en, category, supermarket_id
  HAVING COUNT(*) > 1
)
SELECT 
  CASE WHEN COUNT(*) = 0 
    THEN '✅ 商品数据去重成功 - 无重复记录' 
    ELSE '❌ 仍有重复商品数据' 
  END as product_dedup_status
FROM product_duplicate_check;

-- 显示最终统计
SELECT 
  '超市总数' as metric,
  COUNT(*) as count
FROM supermarkets
UNION ALL
SELECT 
  '商品总数' as metric,
  COUNT(*) as count
FROM products
UNION ALL
SELECT 
  '备份的重复超市数' as metric,
  COUNT(*) as count
FROM deleted_supermarkets_backup
UNION ALL
SELECT 
  '备份的重复商品数' as metric,
  COUNT(*) as count
FROM deleted_products_backup;

-- 显示商品价格分布
SELECT 
  category,
  COUNT(*) as product_count,
  ROUND(MIN(price)::numeric, 2) as min_price,
  ROUND(AVG(price)::numeric, 2) as avg_price,
  ROUND(MAX(price)::numeric, 2) as max_price
FROM products
GROUP BY category
ORDER BY category;

-- 恢复外键约束检查
SET session_replication_role = DEFAULT;

-- 提交事务
COMMIT;

-- 清理临时函数
DROP FUNCTION IF EXISTS clean_product_name(TEXT);

-- 显示完成消息
SELECT '🎉 数据库清理完成！重复数据已删除，约束已添加，性能已优化。' as completion_message;

