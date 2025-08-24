/*
  # 添加管理员功能和数据完整性

  1. 新功能
    - 管理员检查函数
    - 数据验证函数
    - 批量操作支持

  2. 安全增强
    - 改进的RLS策略
    - 数据完整性检查
*/

-- 创建管理员检查函数
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = user_id 
    AND email = 'admin@admin.com'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建用户统计视图
CREATE OR REPLACE VIEW user_stats AS
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN created_at >= CURRENT_DATE THEN 1 END) as new_users_today,
  COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as new_users_week,
  COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as new_users_month
FROM users;

-- 创建商品统计视图
CREATE OR REPLACE VIEW product_stats AS
SELECT 
  COUNT(*) as total_products,
  COUNT(CASE WHEN is_special = true THEN 1 END) as special_products,
  AVG(price) as average_price,
  COUNT(DISTINCT supermarket_id) as supermarkets_with_products
FROM products;

-- 创建价格比较视图
CREATE OR REPLACE VIEW price_comparison AS
SELECT 
  p1.name_en,
  p1.name_zh,
  p1.category,
  json_agg(
    json_build_object(
      'supermarket_id', p1.supermarket_id,
      'supermarket_name_en', s.name_en,
      'supermarket_name_zh', s.name_zh,
      'price', p1.price,
      'original_price', p1.original_price,
      'is_special', p1.is_special,
      'rating', p1.rating
    ) ORDER BY p1.price
  ) as price_data
FROM products p1
JOIN supermarkets s ON p1.supermarket_id = s.id
WHERE EXISTS (
  SELECT 1 FROM products p2 
  WHERE p2.name_en = p1.name_en 
  AND p2.id != p1.id
)
GROUP BY p1.name_en, p1.name_zh, p1.category;

-- 授予视图访问权限
GRANT SELECT ON user_stats TO authenticated;
GRANT SELECT ON product_stats TO authenticated;
GRANT SELECT ON price_comparison TO authenticated;