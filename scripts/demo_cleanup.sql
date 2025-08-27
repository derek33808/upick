/*
  # 数据库清理演示脚本
  
  这个脚本展示清理前后的数据对比，用于演示清理效果
  注意：这是只读查询，不会修改数据
*/

-- 设置输出格式
\pset border 2
\pset format aligned

SELECT '
============================================
       数据库清理效果演示
============================================
' as demo_title;

-- 1. 当前重复数据分析
SELECT '
1. 当前重复数据分析
==================
' as section;

-- 分析重复超市
SELECT '1.1 重复超市分析' as analysis_type;
WITH duplicate_supermarkets AS (
  SELECT 
    name_en, 
    location, 
    COUNT(*) as duplicate_count,
    STRING_AGG(id::text, ', ' ORDER BY id) as ids
  FROM supermarkets
  GROUP BY name_en, location
  HAVING COUNT(*) > 1
)
SELECT 
  name_en as "超市名称",
  location as "位置",
  duplicate_count as "重复数量",
  ids as "ID列表"
FROM duplicate_supermarkets
ORDER BY duplicate_count DESC, name_en;

-- 如果没有重复超市
SELECT 
  CASE 
    WHEN (SELECT COUNT(*) FROM (
      SELECT name_en, location, COUNT(*) 
      FROM supermarkets 
      GROUP BY name_en, location 
      HAVING COUNT(*) > 1
    ) t) = 0 
    THEN '✅ 当前无重复超市数据'
    ELSE ''
  END as status
WHERE (SELECT COUNT(*) FROM (
  SELECT name_en, location, COUNT(*) 
  FROM supermarkets 
  GROUP BY name_en, location 
  HAVING COUNT(*) > 1
) t) = 0;

-- 创建清理商品名称的函数（临时）
CREATE OR REPLACE FUNCTION demo_clean_product_name(product_name TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN TRIM(REGEXP_REPLACE(product_name, '\s*\(Store\s+\d+\)\s*$', '', 'i'));
END;
$$ LANGUAGE plpgsql;

-- 分析重复商品
SELECT '
1.2 重复商品分析（按清理后名称分组）' as analysis_type;
WITH cleaned_products AS (
  SELECT 
    id,
    name_en,
    demo_clean_product_name(name_en) as cleaned_name,
    category,
    price,
    supermarket_id
  FROM products
),
duplicate_analysis AS (
  SELECT 
    cleaned_name,
    category,
    COUNT(*) as duplicate_count,
    MIN(price) as min_price,
    MAX(price) as max_price,
    ROUND(AVG(price)::numeric, 2) as avg_price,
    STRING_AGG(DISTINCT name_en, '; ' ORDER BY name_en) as original_names
  FROM cleaned_products
  GROUP BY cleaned_name, category
  HAVING COUNT(*) > 1
)
SELECT 
  cleaned_name as "清理后商品名",
  category as "类别",
  duplicate_count as "重复数量",
  min_price as "最低价",
  max_price as "最高价",
  avg_price as "平均价",
  LEFT(original_names, 80) || 
    CASE WHEN LENGTH(original_names) > 80 THEN '...' ELSE '' END as "原始名称（截断）"
FROM duplicate_analysis
ORDER BY duplicate_count DESC, cleaned_name
LIMIT 15;

-- 2. 清理效果预览
SELECT '
2. 清理效果预览
===============
' as section;

-- 超市清理效果
SELECT '2.1 超市数据清理效果' as preview_type;
WITH current_supermarkets AS (
  SELECT COUNT(*) as current_count FROM supermarkets
),
unique_supermarkets AS (
  SELECT COUNT(DISTINCT (name_en, location)) as unique_count FROM supermarkets
),
duplicates AS (
  SELECT SUM(duplicate_count - 1) as duplicates_to_remove
  FROM (
    SELECT name_en, location, COUNT(*) as duplicate_count
    FROM supermarkets
    GROUP BY name_en, location
    HAVING COUNT(*) > 1
  ) t
)
SELECT 
  cs.current_count as "当前超市总数",
  us.unique_count as "去重后数量",
  COALESCE(d.duplicates_to_remove, 0) as "将删除的重复项",
  ROUND((COALESCE(d.duplicates_to_remove, 0) * 100.0 / cs.current_count), 1) || '%' as "减少比例"
FROM current_supermarkets cs, unique_supermarkets us, duplicates d;

-- 商品清理效果
SELECT '
2.2 商品数据清理效果' as preview_type;
WITH current_products AS (
  SELECT COUNT(*) as current_count FROM products
),
unique_products AS (
  SELECT COUNT(*) as unique_count
  FROM (
    SELECT DISTINCT demo_clean_product_name(name_en), category
    FROM products
  ) t
),
duplicates AS (
  SELECT SUM(duplicate_count - 1) as duplicates_to_remove
  FROM (
    SELECT demo_clean_product_name(name_en), category, COUNT(*) as duplicate_count
    FROM products
    GROUP BY demo_clean_product_name(name_en), category
    HAVING COUNT(*) > 1
  ) t
)
SELECT 
  cp.current_count as "当前商品总数",
  up.unique_count as "去重后数量",
  COALESCE(d.duplicates_to_remove, 0) as "将删除的重复项",
  ROUND((COALESCE(d.duplicates_to_remove, 0) * 100.0 / cp.current_count), 1) || '%' as "减少比例"
FROM current_products cp, unique_products up, duplicates d;

-- 3. 价格优化分析
SELECT '
3. 价格优化分析
===============
' as section;

SELECT '3.1 重复商品价格差异分析' as price_analysis;
WITH cleaned_products AS (
  SELECT 
    demo_clean_product_name(name_en) as cleaned_name,
    category,
    price,
    ROW_NUMBER() OVER (
      PARTITION BY demo_clean_product_name(name_en), category 
      ORDER BY price ASC
    ) as price_rank
  FROM products
),
duplicate_price_analysis AS (
  SELECT 
    cleaned_name,
    category,
    COUNT(*) as total_variants,
    MIN(price) as lowest_price,
    MAX(price) as highest_price,
    ROUND((MAX(price) - MIN(price))::numeric, 2) as price_difference,
    ROUND(((MAX(price) - MIN(price)) / MIN(price) * 100)::numeric, 1) as price_diff_percentage
  FROM cleaned_products
  GROUP BY cleaned_name, category
  HAVING COUNT(*) > 1
)
SELECT 
  cleaned_name as "商品名称",
  category as "类别",
  total_variants as "价格变体数",
  lowest_price as "最低价",
  highest_price as "最高价",
  price_difference as "价格差",
  price_diff_percentage || '%' as "差异百分比"
FROM duplicate_price_analysis
WHERE price_difference > 0.5  -- 只显示价格差异较大的
ORDER BY price_diff_percentage DESC
LIMIT 10;

-- 4. 数据库大小分析
SELECT '
4. 存储空间分析
===============
' as section;

SELECT '4.1 表大小统计' as storage_analysis;
SELECT 
  'supermarkets' as "表名",
  COUNT(*) as "记录数",
  pg_size_pretty(pg_total_relation_size('supermarkets')) as "当前大小"
FROM supermarkets
UNION ALL
SELECT 
  'products' as "表名",
  COUNT(*) as "记录数",
  pg_size_pretty(pg_total_relation_size('products')) as "当前大小"
FROM products;

-- 5. 建议的清理操作
SELECT '
5. 建议的清理操作
=================
' as section;

SELECT '
基于以上分析，建议执行以下清理操作：

1. 🏪 超市数据去重
   - 删除重复的超市记录
   - 添加唯一约束 (name_en, location)

2. 🛒 商品数据优化
   - 标准化商品名称（移除Store后缀）
   - 保留每个商品的最低价格记录
   - 添加唯一约束 (name_en, category, supermarket_id)

3. 🔒 防护措施
   - 创建触发器自动清理新商品名称
   - 添加索引优化查询性能

4. 📊 性能优化
   - 重建索引
   - 更新统计信息

执行命令：
./scripts/cleanup_database.sh

或者直接执行SQL：
\\i supabase/migrations/20250129000000_cleanup_duplicate_data.sql
' as recommendations;

-- 清理临时函数
DROP FUNCTION IF EXISTS demo_clean_product_name(TEXT);

-- 重置输出格式
\pset format unaligned
\pset border 0

SELECT '
============================================
           演示完成
============================================
' as demo_end;
