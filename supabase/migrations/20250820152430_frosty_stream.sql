/*
  # 填充数据库数据
  
  1. 清理现有数据
  2. 插入超市数据
  3. 插入商品数据
  4. 插入价格历史数据
*/

-- 清理现有数据（按依赖关系顺序）
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
-- 特价商品
('Fresh Tomatoes', '新鲜番茄', 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=300', 2.99, 3.99, 'NZD/kg', 1, 'vegetable', 'New Zealand', 'Grade A', 4.5, true, '2025-01-25', 25),
('Organic Carrots', '有机胡萝卜', 'https://images.pexels.com/photos/143133/pexels-photo-143133.jpeg?auto=compress&cs=tinysrgb&w=300', 3.20, 3.80, 'NZD/kg', 4, 'vegetable', 'Canterbury', 'Organic', 4.6, true, '2025-01-24', 16),
('Mandarin Oranges', '蜜柑', 'https://images.pexels.com/photos/1070946/pexels-photo-1070946.jpeg?auto=compress&cs=tinysrgb&w=300', 5.99, 7.99, 'NZD/kg', 5, 'fruit', 'Nelson', 'Premium', 4.7, true, '2025-01-26', 25),
('Chicken Breast', '鸡胸肉', 'https://images.pexels.com/photos/616354/pexels-photo-616354.jpeg?auto=compress&cs=tinysrgb&w=300', 15.99, 18.99, 'NZD/kg', 4, 'meat', 'New Zealand', 'Premium', 4.6, true, '2025-01-27', 16),
('Fresh Salmon Fillet', '新鲜三文鱼片', 'https://images.pexels.com/photos/725991/pexels-photo-725991.jpeg?auto=compress&cs=tinysrgb&w=300', 25.99, 29.99, 'NZD/kg', 3, 'seafood', 'South Island', 'Premium', 4.7, true, '2025-01-25', 13),
('Greek Yogurt', '希腊酸奶', 'https://images.pexels.com/photos/1435735/pexels-photo-1435735.jpeg?auto=compress&cs=tinysrgb&w=300', 4.50, 5.99, 'NZD/500g', 2, 'dairy', 'Canterbury', 'Fresh', 4.4, true, '2025-01-26', 25),
('Royal Gala Apples', '皇家嘎拉苹果', 'https://images.pexels.com/photos/206959/pexels-photo-206959.jpeg?auto=compress&cs=tinysrgb&w=300', 3.99, 4.99, 'NZD/kg', 1, 'fruit', 'New Zealand', 'Grade A', 4.6, true, '2025-01-28', 20),
('Fresh Spinach', '新鲜菠菜', 'https://images.pexels.com/photos/2255935/pexels-photo-2255935.jpeg?auto=compress&cs=tinysrgb&w=300', 3.50, 4.50, 'NZD/bunch', 3, 'vegetable', 'Canterbury', 'Grade A', 4.2, true, '2025-01-25', 22),
('Premium Beef Mince', '优质牛肉馅', 'https://images.pexels.com/photos/65175/pexels-photo-65175.jpeg?auto=compress&cs=tinysrgb&w=300', 11.99, 14.99, 'NZD/kg', 1, 'meat', 'Canterbury', 'Grade A', 4.4, true, '2025-01-26', 20),
('Fresh Milk', '新鲜牛奶', 'https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&w=300', 2.50, 3.20, 'NZD/L', 2, 'dairy', 'Canterbury', 'Fresh', 4.3, true, '2025-01-24', 22),

-- 普通商品
('Fresh Bananas', '新鲜香蕉', 'https://images.pexels.com/photos/1093038/pexels-photo-1093038.jpeg?auto=compress&cs=tinysrgb&w=300', 2.99, NULL, 'NZD/kg', 1, 'fruit', 'Ecuador', 'Grade A', 4.1, false, NULL, NULL),
('Broccoli', '西兰花', 'https://images.pexels.com/photos/47347/broccoli-vegetable-food-healthy-47347.jpeg?auto=compress&cs=tinysrgb&w=300', 4.50, NULL, 'NZD/kg', 2, 'vegetable', 'New Zealand', 'Fresh', 4.3, false, NULL, NULL),
('Pork Chops', '猪排', 'https://images.pexels.com/photos/3688/food-dinner-lunch-unhealthy.jpg?auto=compress&cs=tinysrgb&w=300', 12.99, NULL, 'NZD/kg', 3, 'meat', 'New Zealand', 'Fresh', 4.2, false, NULL, NULL),
('Green Mussels', '青口贝', 'https://images.pexels.com/photos/566345/pexels-photo-566345.jpeg?auto=compress&cs=tinysrgb&w=300', 8.99, NULL, 'NZD/kg', 4, 'seafood', 'Marlborough', 'Fresh', 4.5, false, NULL, NULL),
('Cheddar Cheese', '切达奶酪', 'https://images.pexels.com/photos/773253/pexels-photo-773253.jpeg?auto=compress&cs=tinysrgb&w=300', 6.99, NULL, 'NZD/250g', 5, 'dairy', 'Canterbury', 'Aged', 4.4, false, NULL, NULL),
('Strawberries', '草莓', 'https://images.pexels.com/photos/89778/strawberries-frisch-ripe-sweet-89778.jpeg?auto=compress&cs=tinysrgb&w=300', 7.99, NULL, 'NZD/punnet', 1, 'fruit', 'Canterbury', 'Fresh', 4.8, false, NULL, NULL),
('Potatoes', '土豆', 'https://images.pexels.com/photos/144248/potatoes-vegetables-erdfrucht-bio-144248.jpeg?auto=compress&cs=tinysrgb&w=300', 3.99, NULL, 'NZD/kg', 2, 'vegetable', 'Canterbury', 'Grade A', 4.0, false, NULL, NULL),
('Lamb Leg', '羊腿', 'https://images.pexels.com/photos/3688/food-dinner-lunch-unhealthy.jpg?auto=compress&cs=tinysrgb&w=300', 18.99, NULL, 'NZD/kg', 3, 'meat', 'Canterbury', 'Premium', 4.7, false, NULL, NULL),
('Prawns', '大虾', 'https://images.pexels.com/photos/566345/pexels-photo-566345.jpeg?auto=compress&cs=tinysrgb&w=300', 22.99, NULL, 'NZD/kg', 4, 'seafood', 'Marlborough', 'Fresh', 4.6, false, NULL, NULL),
('Butter', '黄油', 'https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&w=300', 4.99, NULL, 'NZD/500g', 5, 'dairy', 'Canterbury', 'Fresh', 4.2, false, NULL, NULL),
('Grapes', '葡萄', 'https://images.pexels.com/photos/708777/pexels-photo-708777.jpeg?auto=compress&cs=tinysrgb&w=300', 8.99, NULL, 'NZD/kg', 1, 'fruit', 'Marlborough', 'Fresh', 4.5, false, NULL, NULL),
('Onions', '洋葱', 'https://images.pexels.com/photos/533342/pexels-photo-533342.jpeg?auto=compress&cs=tinysrgb&w=300', 2.99, NULL, 'NZD/kg', 2, 'vegetable', 'Canterbury', 'Grade A', 4.1, false, NULL, NULL),
('Bacon', '培根', 'https://images.pexels.com/photos/3688/food-dinner-lunch-unhealthy.jpg?auto=compress&cs=tinysrgb&w=300', 8.99, NULL, 'NZD/250g', 3, 'meat', 'New Zealand', 'Smoked', 4.3, false, NULL, NULL),
('Fish Fillets', '鱼片', 'https://images.pexels.com/photos/725991/pexels-photo-725991.jpeg?auto=compress&cs=tinysrgb&w=300', 16.99, NULL, 'NZD/kg', 4, 'seafood', 'South Island', 'Fresh', 4.4, false, NULL, NULL),
('Eggs', '鸡蛋', 'https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg?auto=compress&cs=tinysrgb&w=300', 5.99, NULL, 'NZD/dozen', 5, 'dairy', 'Canterbury', 'Free Range', 4.6, false, NULL, NULL),

-- 同一商品在不同超市的价格对比
('Fresh Tomatoes', '新鲜番茄', 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=300', 3.49, NULL, 'NZD/kg', 2, 'vegetable', 'New Zealand', 'Grade A', 4.3, false, NULL, NULL),
('Fresh Tomatoes', '新鲜番茄', 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=300', 3.20, NULL, 'NZD/kg', 3, 'vegetable', 'New Zealand', 'Premium', 4.4, false, NULL, NULL),
('Royal Gala Apples', '皇家嘎拉苹果', 'https://images.pexels.com/photos/206959/pexels-photo-206959.jpeg?auto=compress&cs=tinysrgb&w=300', 4.99, NULL, 'NZD/kg', 2, 'fruit', 'New Zealand', 'Grade A', 4.6, false, NULL, NULL),
('Royal Gala Apples', '皇家嘎拉苹果', 'https://images.pexels.com/photos/206959/pexels-photo-206959.jpeg?auto=compress&cs=tinysrgb&w=300', 4.20, NULL, 'NZD/kg', 3, 'fruit', 'New Zealand', 'Premium', 4.7, false, NULL, NULL),
('Fresh Milk', '新鲜牛奶', 'https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&w=300', 3.20, NULL, 'NZD/L', 1, 'dairy', 'Canterbury', 'Fresh', 4.5, false, NULL, NULL),
('Fresh Milk', '新鲜牛奶', 'https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&w=300', 2.99, NULL, 'NZD/L', 4, 'dairy', 'Canterbury', 'Fresh', 4.2, false, NULL, NULL),
('Organic Carrots', '有机胡萝卜', 'https://images.pexels.com/photos/143133/pexels-photo-143133.jpeg?auto=compress&cs=tinysrgb&w=300', 3.80, NULL, 'NZD/kg', 1, 'vegetable', 'Canterbury', 'Organic', 4.4, false, NULL, NULL),
('Organic Carrots', '有机胡萝卜', 'https://images.pexels.com/photos/143133/pexels-photo-143133.jpeg?auto=compress&cs=tinysrgb&w=300', 3.50, NULL, 'NZD/kg', 2, 'vegetable', 'Canterbury', 'Organic', 4.5, false, NULL, NULL);

-- 插入价格历史数据
INSERT INTO price_history (product_id, price, original_price, is_special, recorded_at) VALUES
(1, 3.99, NULL, false, '2025-01-15 10:00:00'),
(1, 2.99, 3.99, true, '2025-01-20 10:00:00'),
(2, 3.80, NULL, false, '2025-01-18 10:00:00'),
(2, 3.20, 3.80, true, '2025-01-22 10:00:00'),
(3, 7.99, NULL, false, '2025-01-16 10:00:00'),
(3, 5.99, 7.99, true, '2025-01-21 10:00:00'),
(4, 18.99, NULL, false, '2025-01-17 10:00:00'),
(4, 15.99, 18.99, true, '2025-01-23 10:00:00'),
(5, 29.99, NULL, false, '2025-01-19 10:00:00'),
(5, 25.99, 29.99, true, '2025-01-20 10:00:00'),
(6, 5.99, NULL, false, '2025-01-14 10:00:00'),
(6, 4.50, 5.99, true, '2025-01-21 10:00:00'),
(7, 4.99, NULL, false, '2025-01-13 10:00:00'),
(7, 3.99, 4.99, true, '2025-01-24 10:00:00'),
(8, 4.50, NULL, false, '2025-01-12 10:00:00'),
(8, 3.50, 4.50, true, '2025-01-20 10:00:00');