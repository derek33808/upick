/*
  # 导入完整的杂货店数据
  
  1. 清理现有数据
  2. 导入超市数据
  3. 导入商品数据
  4. 导入价格历史数据
*/

-- 清理现有数据
TRUNCATE TABLE user_favorites CASCADE;
TRUNCATE TABLE price_history CASCADE;
TRUNCATE TABLE products CASCADE;
TRUNCATE TABLE supermarkets CASCADE;

-- 重置序列
ALTER SEQUENCE IF EXISTS supermarkets_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS products_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS user_favorites_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS price_history_id_seq RESTART WITH 1;

-- 插入超市数据
INSERT INTO supermarkets (name_en, name_zh, location, logo_url, latitude, longitude, phone, hours, rating) VALUES
('Pak''nSave Riccarton', '派克储蓄超市', 'Riccarton', 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=100', -43.53, 172.62, '+64 3 348 8052', '7:00 AM - 10:00 PM', 4.2),
('Countdown Westfield', '倒计时超市', 'Riccarton', 'https://images.pexels.com/photos/1005638/pexels-photo-1005638.jpeg?auto=compress&cs=tinysrgb&w=100', -43.53, 172.61, '+64 3 348 7766', '6:00 AM - 12:00 AM', 4.0),
('FreshChoice Barrington', '新鲜选择超市', 'Barrington', 'https://images.pexels.com/photos/2292919/pexels-photo-2292919.jpeg?auto=compress&cs=tinysrgb&w=100', -43.54, 172.61, '+64 3 338 3045', '7:00 AM - 9:00 PM', 4.3),
('Tai Wah Supermarket', '大华超市', 'Riccarton', 'https://images.pexels.com/photos/8472816/pexels-photo-8472816.jpeg?auto=compress&cs=tinysrgb&w=100', -43.53, 172.60, '+64 3 348 3288', '8:00 AM - 9:00 PM', 4.5),
('New World Hornby', '新世界超市', 'Hornby', 'https://images.pexels.com/photos/4199098/pexels-photo-4199098.jpeg?auto=compress&cs=tinysrgb&w=100', -43.53, 172.55, '+64 3 349 7018', '7:00 AM - 10:00 PM', 4.1);

-- 插入商品数据
INSERT INTO products (name_en, name_zh, image_url, price, original_price, unit, supermarket_id, category, origin, freshness, rating, is_special, special_end_date, discount_percentage) VALUES
-- 水果类
('Royal Gala Apples', '皇家嘎拉苹果', 'https://images.pexels.com/photos/206959/pexels-photo-206959.jpeg?auto=compress&cs=tinysrgb&w=300', 4.99, NULL, 'NZD/kg', 1, 'fruit', 'New Zealand', 'Grade A', 4.6, false, NULL, NULL),
('Royal Gala Apples', '皇家嘎拉苹果', 'https://images.pexels.com/photos/206959/pexels-photo-206959.jpeg?auto=compress&cs=tinysrgb&w=300', 4.50, NULL, 'NZD/kg', 2, 'fruit', 'New Zealand', 'Premium', 4.8, false, NULL, NULL),
('Royal Gala Apples', '皇家嘎拉苹果', 'https://images.pexels.com/photos/206959/pexels-photo-206959.jpeg?auto=compress&cs=tinysrgb&w=300', 4.20, NULL, 'NZD/kg', 3, 'fruit', 'New Zealand', 'Premium', 4.7, false, NULL, NULL),
('Fresh Bananas', '新鲜香蕉', 'https://images.pexels.com/photos/1093038/pexels-photo-1093038.jpeg?auto=compress&cs=tinysrgb&w=300', 2.99, NULL, 'NZD/kg', 1, 'fruit', 'Ecuador', 'Grade A', 4.1, false, NULL, NULL),
('Fresh Bananas', '新鲜香蕉', 'https://images.pexels.com/photos/1093038/pexels-photo-1093038.jpeg?auto=compress&cs=tinysrgb&w=300', 3.20, NULL, 'NZD/kg', 2, 'fruit', 'Ecuador', 'Grade A', 4.2, false, NULL, NULL),
('Mandarin Oranges', '蜜柑', 'https://images.pexels.com/photos/1070946/pexels-photo-1070946.jpeg?auto=compress&cs=tinysrgb&w=300', 5.99, 7.99, 'NZD/kg', 5, 'fruit', 'Nelson', 'Premium', 4.7, true, '2025-01-25', 25),
('Fresh Strawberries', '新鲜草莓', 'https://images.pexels.com/photos/89778/strawberries-frisch-ripe-sweet-89778.jpeg?auto=compress&cs=tinysrgb&w=300', 8.99, 10.99, 'NZD/punnet', 1, 'fruit', 'Canterbury', 'Premium', 4.8, true, '2025-01-23', 18),
('Green Grapes', '绿葡萄', 'https://images.pexels.com/photos/23042/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=300', 6.50, NULL, 'NZD/kg', 2, 'fruit', 'Australia', 'Grade A', 4.4, false, NULL, NULL),

-- 蔬菜类
('Fresh Tomatoes', '新鲜番茄', 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=300', 2.99, 3.99, 'NZD/kg', 1, 'vegetable', 'New Zealand', 'Grade A', 4.5, true, '2025-01-24', 25),
('Fresh Tomatoes', '新鲜番茄', 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=300', 3.49, NULL, 'NZD/kg', 2, 'vegetable', 'New Zealand', 'Grade A', 4.3, false, NULL, NULL),
('Fresh Tomatoes', '新鲜番茄', 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=300', 3.20, NULL, 'NZD/kg', 3, 'vegetable', 'New Zealand', 'Premium', 4.4, false, NULL, NULL),
('Organic Carrots', '有机胡萝卜', 'https://images.pexels.com/photos/143133/pexels-photo-143133.jpeg?auto=compress&cs=tinysrgb&w=300', 3.20, 3.80, 'NZD/kg', 4, 'vegetable', 'Canterbury', 'Organic', 4.6, true, '2025-01-22', 16),
('Organic Carrots', '有机胡萝卜', 'https://images.pexels.com/photos/143133/pexels-photo-143133.jpeg?auto=compress&cs=tinysrgb&w=300', 3.80, NULL, 'NZD/kg', 1, 'vegetable', 'Canterbury', 'Organic', 4.4, false, NULL, NULL),
('Organic Carrots', '有机胡萝卜', 'https://images.pexels.com/photos/143133/pexels-photo-143133.jpeg?auto=compress&cs=tinysrgb&w=300', 3.50, NULL, 'NZD/kg', 2, 'vegetable', 'Canterbury', 'Organic', 4.5, false, NULL, NULL),
('Fresh Spinach', '新鲜菠菜', 'https://images.pexels.com/photos/2255935/pexels-photo-2255935.jpeg?auto=compress&cs=tinysrgb&w=300', 4.50, NULL, 'NZD/bunch', 3, 'vegetable', 'Canterbury', 'Grade A', 4.2, false, NULL, NULL),
('Fresh Broccoli', '新鲜西兰花', 'https://images.pexels.com/photos/47347/broccoli-vegetable-food-healthy-47347.jpeg?auto=compress&cs=tinysrgb&w=300', 3.99, 4.99, 'NZD/each', 2, 'vegetable', 'Canterbury', 'Grade A', 4.3, true, '2025-01-26', 20),
('Red Capsicum', '红辣椒', 'https://images.pexels.com/photos/594137/pexels-photo-594137.jpeg?auto=compress&cs=tinysrgb&w=300', 7.99, NULL, 'NZD/kg', 1, 'vegetable', 'New Zealand', 'Premium', 4.1, false, NULL, NULL),
('Fresh Lettuce', '新鲜生菜', 'https://images.pexels.com/photos/1656663/pexels-photo-1656663.jpeg?auto=compress&cs=tinysrgb&w=300', 2.50, NULL, 'NZD/each', 4, 'vegetable', 'Canterbury', 'Grade A', 4.0, false, NULL, NULL),

-- 肉类
('Premium Beef Mince', '优质牛肉馅', 'https://images.pexels.com/photos/65175/pexels-photo-65175.jpeg?auto=compress&cs=tinysrgb&w=300', 12.99, NULL, 'NZD/kg', 1, 'meat', 'Canterbury', 'Grade A', 4.4, false, NULL, NULL),
('Chicken Breast', '鸡胸肉', 'https://images.pexels.com/photos/616354/pexels-photo-616354.jpeg?auto=compress&cs=tinysrgb&w=300', 15.99, 18.99, 'NZD/kg', 4, 'meat', 'New Zealand', 'Premium', 4.6, true, '2025-01-27', 16),
('Chicken Breast', '鸡胸肉', 'https://images.pexels.com/photos/616354/pexels-photo-616354.jpeg?auto=compress&cs=tinysrgb&w=300', 17.50, NULL, 'NZD/kg', 2, 'meat', 'New Zealand', 'Premium', 4.5, false, NULL, NULL),
('Pork Chops', '猪排', 'https://images.pexels.com/photos/3688/food-dinner-lunch-unhealthy.jpg?auto=compress&cs=tinysrgb&w=300', 14.99, NULL, 'NZD/kg', 3, 'meat', 'New Zealand', 'Grade A', 4.2, false, NULL, NULL),
('Lamb Leg', '羊腿', 'https://images.pexels.com/photos/299347/pexels-photo-299347.jpeg?auto=compress&cs=tinysrgb&w=300', 22.99, 25.99, 'NZD/kg', 1, 'meat', 'Canterbury', 'Premium', 4.7, true, '2025-01-28', 12),

-- 海鲜类
('Fresh Salmon Fillet', '新鲜三文鱼片', 'https://images.pexels.com/photos/725991/pexels-photo-725991.jpeg?auto=compress&cs=tinysrgb&w=300', 28.99, NULL, 'NZD/kg', 3, 'seafood', 'South Island', 'Premium', 4.7, false, NULL, NULL),
('Fresh Salmon Fillet', '新鲜三文鱼片', 'https://images.pexels.com/photos/725991/pexels-photo-725991.jpeg?auto=compress&cs=tinysrgb&w=300', 26.99, 29.99, 'NZD/kg', 1, 'seafood', 'South Island', 'Premium', 4.8, true, '2025-01-25', 10),
('Green Mussels', '青口贝', 'https://images.pexels.com/photos/566345/pexels-photo-566345.jpeg?auto=compress&cs=tinysrgb&w=300', 8.99, NULL, 'NZD/kg', 2, 'seafood', 'Marlborough', 'Fresh', 4.3, false, NULL, NULL),
('Fresh Prawns', '新鲜虾', 'https://images.pexels.com/photos/725997/pexels-photo-725997.jpeg?auto=compress&cs=tinysrgb&w=300', 35.99, 39.99, 'NZD/kg', 4, 'seafood', 'New Zealand', 'Premium', 4.6, true, '2025-01-24', 10),
('Fish Fillets', '鱼片', 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=300', 18.99, NULL, 'NZD/kg', 5, 'seafood', 'New Zealand', 'Fresh', 4.2, false, NULL, NULL),

-- 乳制品
('Fresh Milk', '新鲜牛奶', 'https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&w=300', 2.80, NULL, 'NZD/L', 2, 'dairy', 'Canterbury', 'Fresh', 4.3, false, NULL, NULL),
('Fresh Milk', '新鲜牛奶', 'https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&w=300', 3.20, NULL, 'NZD/L', 1, 'dairy', 'Canterbury', 'Fresh', 4.5, false, NULL, NULL),
('Fresh Milk', '新鲜牛奶', 'https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&w=300', 2.99, NULL, 'NZD/L', 4, 'dairy', 'Canterbury', 'Fresh', 4.2, false, NULL, NULL),
('Greek Yogurt', '希腊酸奶', 'https://images.pexels.com/photos/1435735/pexels-photo-1435735.jpeg?auto=compress&cs=tinysrgb&w=300', 6.99, 7.99, 'NZD/500g', 3, 'dairy', 'New Zealand', 'Premium', 4.6, true, '2025-01-26', 13),
('Cheddar Cheese', '切达奶酪', 'https://images.pexels.com/photos/773253/pexels-photo-773253.jpeg?auto=compress&cs=tinysrgb&w=300', 8.50, NULL, 'NZD/250g', 1, 'dairy', 'New Zealand', 'Aged', 4.4, false, NULL, NULL),
('Free Range Eggs', '散养鸡蛋', 'https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg?auto=compress&cs=tinysrgb&w=300', 7.99, 8.99, 'NZD/dozen', 2, 'dairy', 'Canterbury', 'Free Range', 4.7, true, '2025-01-23', 11),
('Butter', '黄油', 'https://images.pexels.com/photos/209206/pexels-photo-209206.jpeg?auto=compress&cs=tinysrgb&w=300', 5.50, NULL, 'NZD/500g', 4, 'dairy', 'New Zealand', 'Premium', 4.3, false, NULL, NULL),
('Cream Cheese', '奶油奶酪', 'https://images.pexels.com/photos/1435735/pexels-photo-1435735.jpeg?auto=compress&cs=tinysrgb&w=300', 4.99, NULL, 'NZD/250g', 5, 'dairy', 'New Zealand', 'Fresh', 4.1, false, NULL, NULL);

-- 插入价格历史数据
INSERT INTO price_history (product_id, price, original_price, is_special, recorded_at) VALUES
(1, 4.99, NULL, false, NOW() - INTERVAL '1 day'),
(2, 4.50, NULL, false, NOW() - INTERVAL '1 day'),
(3, 4.20, NULL, false, NOW() - INTERVAL '1 day'),
(9, 2.99, 3.99, true, NOW() - INTERVAL '2 hours'),
(12, 3.20, 3.80, true, NOW() - INTERVAL '3 hours'),
(6, 5.99, 7.99, true, NOW() - INTERVAL '1 hour'),
(7, 8.99, 10.99, true, NOW() - INTERVAL '4 hours'),
(18, 3.99, 4.99, true, NOW() - INTERVAL '5 hours'),
(22, 15.99, 18.99, true, NOW() - INTERVAL '6 hours'),
(25, 22.99, 25.99, true, NOW() - INTERVAL '2 hours'),
(27, 26.99, 29.99, true, NOW() - INTERVAL '3 hours'),
(29, 35.99, 39.99, true, NOW() - INTERVAL '1 hour'),
(33, 6.99, 7.99, true, NOW() - INTERVAL '4 hours'),
(36, 7.99, 8.99, true, NOW() - INTERVAL '2 hours');