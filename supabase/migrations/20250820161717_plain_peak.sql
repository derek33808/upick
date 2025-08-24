/*
  # Create views and statistics

  1. Views
    - `user_stats` - User statistics view
    - `product_stats` - Product statistics view
    - `price_comparison` - Price comparison view
*/

-- Create user statistics view
CREATE OR REPLACE VIEW user_stats AS
SELECT 
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as new_users_today,
  COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as new_users_week,
  COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_users_month
FROM users;

-- Create product statistics view
CREATE OR REPLACE VIEW product_stats AS
SELECT 
  COUNT(*) as total_products,
  COUNT(*) FILTER (WHERE is_special = true) as special_products,
  AVG(price) as average_price,
  COUNT(DISTINCT supermarket_id) as supermarkets_with_products
FROM products;

-- Create price comparison view
CREATE OR REPLACE VIEW price_comparison AS
SELECT 
  p.name_en,
  p.name_zh,
  p.category,
  json_agg(
    json_build_object(
      'supermarket_name_en', s.name_en,
      'supermarket_name_zh', s.name_zh,
      'price', p.price,
      'original_price', p.original_price,
      'is_special', p.is_special,
      'discount_percentage', p.discount_percentage
    ) ORDER BY p.price
  ) as price_data
FROM products p
JOIN supermarkets s ON p.supermarket_id = s.id
GROUP BY p.name_en, p.name_zh, p.category;