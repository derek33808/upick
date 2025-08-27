/*
  # 数据库验证脚本
  
  用于验证数据库清理后的状态和数据完整性
*/

-- 设置输出格式
\pset border 2
\pset format aligned

-- 显示标题
SELECT '
==============================================
     数据库状态验证报告
==============================================
' as title;

-- 1. 重复数据检查
SELECT '
1. 重复数据检查
================
' as section;

-- 检查重复超市
SELECT '1.1 重复超市检查:' as check_type;
WITH duplicate_supermarkets AS (
  SELECT name_en, location, COUNT(*) as count
  FROM supermarkets
  GROUP BY name_en, location
  HAVING COUNT(*) > 1
)
SELECT 
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ 通过: 无重复超市记录'
    ELSE '❌ 失败: 发现 ' || COUNT(*) || ' 组重复超市'
  END as result,
  COUNT(*) as duplicate_groups
FROM duplicate_supermarkets;

-- 如果有重复，显示详情
WITH duplicate_supermarkets AS (
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
JOIN duplicate_supermarkets d ON s.name_en = d.name_en AND s.location = d.location
ORDER BY s.name_en, s.location;

-- 检查重复商品
SELECT '1.2 重复商品检查:' as check_type;
WITH duplicate_products AS (
  SELECT name_en, category, supermarket_id, COUNT(*) as count
  FROM products
  GROUP BY name_en, category, supermarket_id
  HAVING COUNT(*) > 1
)
SELECT 
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ 通过: 无重复商品记录'
    ELSE '❌ 失败: 发现 ' || COUNT(*) || ' 组重复商品'
  END as result,
  COUNT(*) as duplicate_groups
FROM duplicate_products;

-- 2. 数据完整性检查
SELECT '
2. 数据完整性检查
=================
' as section;

-- 检查外键完整性
SELECT '2.1 外键完整性检查:' as check_type;
SELECT 
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ 通过: 所有商品都有有效的超市引用'
    ELSE '❌ 失败: 有 ' || COUNT(*) || ' 个商品引用了不存在的超市'
  END as result
FROM products p
LEFT JOIN supermarkets s ON p.supermarket_id = s.id
WHERE s.id IS NULL;

-- 检查必填字段
SELECT '2.2 必填字段检查:' as check_type;

-- 超市必填字段
SELECT 
  'supermarkets.name_en' as field,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ 通过'
    ELSE '❌ 失败: ' || COUNT(*) || ' 个空值'
  END as result
FROM supermarkets
WHERE name_en IS NULL OR name_en = '';

SELECT 
  'supermarkets.location' as field,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ 通过'
    ELSE '❌ 失败: ' || COUNT(*) || ' 个空值'
  END as result
FROM supermarkets
WHERE location IS NULL OR location = '';

-- 商品必填字段
SELECT 
  'products.name_en' as field,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ 通过'
    ELSE '❌ 失败: ' || COUNT(*) || ' 个空值'
  END as result
FROM products
WHERE name_en IS NULL OR name_en = '';

SELECT 
  'products.price' as field,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ 通过'
    ELSE '❌ 失败: ' || COUNT(*) || ' 个空值或负值'
  END as result
FROM products
WHERE price IS NULL OR price < 0;

-- 3. 数据质量检查
SELECT '
3. 数据质量检查
===============
' as section;

-- 检查商品名称是否还包含Store后缀
SELECT '3.1 商品名称规范化检查:' as check_type;
SELECT 
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ 通过: 所有商品名称已规范化'
    ELSE '❌ 需要注意: 仍有 ' || COUNT(*) || ' 个商品名称包含Store后缀'
  END as result
FROM products
WHERE name_en ~* '\(Store\s+\d+\)';

-- 显示仍包含后缀的商品（如果有）
SELECT 
  id,
  name_en,
  supermarket_id
FROM products
WHERE name_en ~* '\(Store\s+\d+\)'
LIMIT 10;

-- 检查价格合理性
SELECT '3.2 价格合理性检查:' as check_type;
SELECT 
  category,
  COUNT(*) as total_products,
  MIN(price) as min_price,
  ROUND(AVG(price)::numeric, 2) as avg_price,
  MAX(price) as max_price,
  CASE 
    WHEN MIN(price) < 0 THEN '❌ 有负价格'
    WHEN MAX(price) > 1000 THEN '⚠️ 有超高价格'
    ELSE '✅ 价格范围正常'
  END as status
FROM products
GROUP BY category
ORDER BY avg_price DESC;

-- 4. 约束和索引检查
SELECT '
4. 约束和索引检查
=================
' as section;

-- 检查唯一约束
SELECT '4.1 唯一约束检查:' as check_type;
SELECT 
  constraint_name,
  table_name,
  CASE 
    WHEN constraint_name IS NOT NULL THEN '✅ 已创建'
    ELSE '❌ 缺失'
  END as status
FROM information_schema.table_constraints
WHERE constraint_type = 'UNIQUE'
  AND table_name IN ('supermarkets', 'products')
  AND constraint_name IN ('unique_supermarket_name_location', 'unique_product_per_supermarket');

-- 检查索引
SELECT '4.2 索引检查:' as check_type;
SELECT 
  indexname,
  tablename,
  '✅ 存在' as status
FROM pg_indexes
WHERE tablename IN ('supermarkets', 'products')
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- 5. 统计信息
SELECT '
5. 数据统计信息
===============
' as section;

-- 基本统计
SELECT '5.1 基本统计:' as subsection;
SELECT 
  'supermarkets' as table_name,
  COUNT(*) as record_count,
  'N/A' as special_count
FROM supermarkets
UNION ALL
SELECT 
  'products' as table_name,
  COUNT(*) as record_count,
  COUNT(*) FILTER (WHERE is_special = true)::text as special_count
FROM products;

-- 类别分布
SELECT '5.2 商品类别分布:' as subsection;
SELECT 
  category,
  COUNT(*) as product_count,
  ROUND(AVG(price)::numeric, 2) as avg_price,
  COUNT(*) FILTER (WHERE is_special = true) as special_offers
FROM products
GROUP BY category
ORDER BY product_count DESC;

-- 超市商品分布
SELECT '5.3 超市商品分布 (前10名):' as subsection;
SELECT 
  s.name_en,
  s.location,
  COUNT(p.id) as product_count,
  ROUND(AVG(p.price)::numeric, 2) as avg_price
FROM supermarkets s
LEFT JOIN products p ON s.id = p.supermarket_id
GROUP BY s.id, s.name_en, s.location
ORDER BY product_count DESC
LIMIT 10;

-- 6. 备份表检查
SELECT '
6. 备份数据检查
===============
' as section;

-- 检查备份表是否存在
SELECT '6.1 备份表状态:' as check_type;
SELECT 
  table_name,
  CASE 
    WHEN table_name IS NOT NULL THEN '✅ 存在'
    ELSE '❌ 不存在'
  END as status
FROM information_schema.tables
WHERE table_name IN ('deleted_supermarkets_backup', 'deleted_products_backup')
  AND table_schema = 'public';

-- 显示备份数据统计
SELECT 
  'deleted_supermarkets_backup' as backup_table,
  COUNT(*) as deleted_records
FROM deleted_supermarkets_backup
WHERE EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_name = 'deleted_supermarkets_backup'
);

SELECT 
  'deleted_products_backup' as backup_table,
  COUNT(*) as deleted_records
FROM deleted_products_backup
WHERE EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_name = 'deleted_products_backup'
);

-- 7. 性能检查
SELECT '
7. 性能优化检查
===============
' as section;

-- 检查表大小
SELECT '7.1 表大小统计:' as check_type;
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE tablename IN ('supermarkets', 'products')
  AND schemaname = 'public';

-- 显示完成信息
SELECT '
==============================================
           验证报告完成
==============================================
' as completion;

-- 重置输出格式
\pset format unaligned
\pset border 0

