/*
  # 更新超市数据
  
  1. 清空现有超市数据
  2. 导入新的超市数据（基于超市_修正版本.md）
  3. 更新相关产品的supermarket_id
  
  注意：此迁移会清空所有现有超市数据并重新导入
*/

-- 临时禁用外键约束检查
SET session_replication_role = replica;

-- 清空现有超市数据
TRUNCATE TABLE supermarkets RESTART IDENTITY CASCADE;

-- 重新插入超市数据
INSERT INTO supermarkets (name_en, name_zh, location, latitude, longitude, phone, hours, rating) VALUES
-- Woolworths (Countdown) 连锁超市
('Woolworths (Countdown) Belfast', 'Woolworths (Countdown)（Belfast）', '1 Radcliffe Rd, Belfast', -43.469, 172.639, '+64 3 383 4200', '6:00 AM - 12:00 AM', 4.1),
('Woolworths (Countdown) Avonhead', 'Woolworths (Countdown)（Avonhead）', 'Corner Withells Rd & Merrin St, Avonhead', -43.518, 172.564, '+64 3 348 8000', '6:00 AM - 12:00 AM', 4.0),
('Woolworths (Countdown) Airport', 'Woolworths (Countdown)（Airport）', '544 Memorial Ave, Christchurch Airport', -43.483, 172.533, '+64 3 358 4400', '6:00 AM - 12:00 AM', 4.2),
('Woolworths (Countdown) Riccarton', 'Woolworths (Countdown)（Riccarton）', 'Cnr Riccarton Rd & Hansons Lane, Riccarton', -43.531, 172.574, '+64 3 348 7766', '6:00 AM - 12:00 AM', 4.0),
('Woolworths (Countdown) Linwood', 'Woolworths (Countdown)（Linwood）', 'Cnr Buckleys Rd & Linwood Ave, Linwood', -43.534, 172.673, '+64 3 381 4500', '6:00 AM - 12:00 AM', 3.9),
('Woolworths (Countdown) Ferrymead', 'Woolworths (Countdown)（Ferrymead）', '999 Ferry Rd, Ferrymead', -43.541, 172.684, '+64 3 384 2200', '6:00 AM - 12:00 AM', 4.1),
('Woolworths (Countdown) Hornby', 'Woolworths (Countdown)（Hornby）', 'Cnr Main South Rd & Chappie Pl, Hornby', -43.537, 172.518, '+64 3 349 8800', '6:00 AM - 12:00 AM', 4.0),
('Woolworths (Countdown) Central City', 'Woolworths (Countdown)（Central City）', '347 Moorhouse Ave, Central City', -43.535, 172.639, '+64 3 365 5200', '6:00 AM - 12:00 AM', 4.2),
('Woolworths (Countdown) Papanui', 'Woolworths (Countdown)（Papanui）', 'Cnr Main North Rd & Sawyers Arms Rd, Papanui', -43.497, 172.618, '+64 3 352 5050', '6:00 AM - 12:00 AM', 4.1),
('Woolworths (Countdown) Shirley', 'Woolworths (Countdown)（Shirley）', 'Marshlands Rd, Shirley', -43.506, 172.689, '+64 3 385 3300', '6:00 AM - 12:00 AM', 4.0),
('Woolworths (Countdown) Beckenham', 'Woolworths (Countdown)（Beckenham）', '219 Colombo St, Beckenham', -43.547, 172.646, '+64 3 337 1200', '6:00 AM - 12:00 AM', 4.1),

-- New World 连锁超市
('New World Bishopdale', 'New World（Bishopdale）', 'Cnr Farrington Ave & Harewood Rd, Bishopdale', -43.504, 172.585, '+64 3 359 4040', '7:00 AM - 10:00 PM', 4.2),
('New World Central City', 'New World（Central City）', '175 Durham St South, Central City', -43.532, 172.633, '+64 3 365 4000', '7:00 AM - 10:00 PM', 4.1),
('New World Fendalton', 'New World（Fendalton）', '19-23 Memorial Ave, Fendalton', -43.523, 172.588, '+64 3 351 4040', '7:00 AM - 10:00 PM', 4.3),
('New World Halswell', 'New World（Halswell）', '346 Halswell Rd, Halswell', -43.582, 172.574, '+64 3 322 4000', '7:00 AM - 10:00 PM', 4.2),
('New World Ilam', 'New World（Ilam）', '47c-57c Peer St, Ilam', -43.525, 172.581, '+64 3 358 6000', '7:00 AM - 10:00 PM', 4.1),
('New World Lincoln', 'New World（Lincoln）', '77 Gerald St, Lincoln', -43.606, 172.483, '+64 3 325 3000', '7:00 AM - 10:00 PM', 4.0),
('New World Northwood', 'New World（Northwood）', '2 Mounter Ave, Northwood', -43.469, 172.607, '+64 3 354 4000', '7:00 AM - 10:00 PM', 4.2),
('New World Rolleston', 'New World（Rolleston）', '92 Rolleston Dr, Rolleston', -43.595, 172.384, '+64 3 347 5000', '7:00 AM - 10:00 PM', 4.1),
('New World Martins', 'New World（Martins）', '92 Wilsons Rd, St Martins', -43.549, 172.656, '+64 3 337 5000', '7:00 AM - 10:00 PM', 4.0),
('New World Richmond', 'New World（Richmond）', '288 Stanmore Rd, Richmond', -43.53, 172.657, '+64 3 389 4000', '7:00 AM - 10:00 PM', 4.1),
('New World Marshlands', 'New World（Marshlands）', '420 Marshlands Rd, Marshlands', -43.486, 172.684, '+64 3 385 2000', '7:00 AM - 10:00 PM', 4.2),
('New World Wigram', 'New World（Wigram）', '51 Skyhawk Rd, Wigram', -43.556, 172.561, '+64 3 343 2000', '7:00 AM - 10:00 PM', 4.0),
('New World Woolston', 'New World（Woolston）', '7-11 St John St, Woolston', -43.54, 172.668, '+64 3 384 1000', '7:00 AM - 10:00 PM', 4.1),

-- Pak'nSave 连锁超市
('Pak''nSave Hornby', 'Pak''nSave（Hornby）', 'The Hub Hornby, Main South Rd, Hornby', -43.538, 172.536, '+64 3 349 8052', '7:00 AM - 10:00 PM', 4.2),
('Pak''nSave Sydenham', 'Pak''nSave（Sydenham）', '297 Moorhouse Ave, Sydenham', -43.539, 172.639, '+64 3 365 5000', '7:00 AM - 10:00 PM', 4.0),
('Pak''nSave Papanui', 'Pak''nSave（Papanui）', 'Northlands Mall, Main North Rd, Papanui', -43.497, 172.618, '+64 3 352 4000', '7:00 AM - 10:00 PM', 4.1),
('Pak''nSave Westfield', 'Pak''nSave（Westfield）', 'Westfield Riccarton, Riccarton Rd', -43.53, 172.585, '+64 3 348 8052', '7:00 AM - 10:00 PM', 4.2),
('Pak''nSave Wainoni', 'Pak''nSave（Wainoni）', '174 Wainoni Rd, Wainoni', -43.518, 172.695, '+64 3 385 4000', '7:00 AM - 10:00 PM', 4.0),

-- Four Square 连锁超市
('Four Square Papanui', 'Four Square（Papanui）', '167 Main North Rd, Papanui', -43.504, 172.612, '+64 3 352 2020', '7:00 AM - 9:00 PM', 4.0),

-- FreshChoice 连锁超市
('FreshChoice Barrington', 'FreshChoice（Barrington）', '256 Barrington St, Barrington', -43.555, 172.628, '+64 3 338 3045', '7:00 AM - 9:00 PM', 4.3),
('FreshChoice City', 'FreshChoice（City）', '71 Lichfield St, Central City', -43.534, 172.636, '+64 3 366 2000', '7:00 AM - 9:00 PM', 4.1),
('FreshChoice Edgeware', 'FreshChoice（Edgeware）', '61 Edgeware Rd, Edgeware', -43.518, 172.646, '+64 3 355 3000', '7:00 AM - 9:00 PM', 4.0),
('FreshChoice Merivale', 'FreshChoice（Merivale）', '189 Papanui Rd, Merivale', -43.518, 172.632, '+64 3 355 5000', '7:00 AM - 9:00 PM', 4.2),
('FreshChoice Parklands', 'FreshChoice（Parklands）', '60 Queenspark Dr, Parklands', -43.502, 172.709, '+64 3 385 6000', '7:00 AM - 9:00 PM', 4.1),

-- SuperValue 连锁超市
('SuperValue Edgeware', 'SuperValue（Edgeware）', '61 Edgeware Rd, Edgeware', -43.518, 172.646, '+64 3 355 3001', '7:00 AM - 9:00 PM', 4.0),
('SuperValue Fendalton', 'SuperValue（Fendalton）', 'Cnr Ilam Rd & Clyde Rd, Fendalton', -43.516, 172.585, '+64 3 351 3000', '7:00 AM - 9:00 PM', 4.1),
('SuperValue Spreydon', 'SuperValue（Spreydon）', '108 Lincoln Rd, Spreydon', -43.55, 172.616, '+64 3 338 2000', '7:00 AM - 9:00 PM', 4.0),
('SuperValue Lyttelton', 'SuperValue（Lyttelton）', '17 London St, Lyttelton', -43.6, 172.72, '+64 3 328 8000', '8:00 AM - 8:00 PM', 4.2),
('SuperValue Sumner', 'SuperValue（Sumner）', 'Nayland St, Sumner', -43.569, 172.759, '+64 3 326 5000', '8:00 AM - 8:00 PM', 4.1),

-- Night 'n Day 便利店
('Night ''n Day Woolston', 'Night ''n Day（Woolston）', '679 Ferry Rd, Woolston', -43.541, 172.684, '+64 3 384 3000', '24 Hours', 3.8),
('Night ''n Day Riccarton', 'Night ''n Day（Riccarton）', '11 Riccarton Rd, Riccarton', -43.529, 172.597, '+64 3 348 2000', '24 Hours', 3.9),

-- 亚洲超市
('Sunson Asian Food Market Riccarton', '三商亚洲超市（Riccarton）', '386 Riccarton Road, Upper Riccarton', -43.53, 172.585, '+64 3 348 3288', '9:00 AM - 8:00 PM', 4.5),
('Sunson Asian Food Market Wigram', '三商亚洲超市（Wigram）', '17 Lodestar Avenue, Wigram', -43.556, 172.561, '+64 3 343 3288', '9:00 AM - 8:00 PM', 4.4),
('Sunson Asian Food Market Papanui', '三商亚洲食品（Papanui）', '20 Main North Rd, Papanui', -43.505, 172.61, '+64 3 352 3288', '9:00 AM - 8:00 PM', 4.3),
('Kosco Asian Supermarket Ilam', 'Kosco Asian Supermarket（Ilam）', '209A Waimairi Rd, Ilam', -43.53, 172.574, '+64 3 358 1888', '9:00 AM - 8:00 PM', 4.4),
('Kosco Asian Supermarket Riccarton', 'Kosco Asian Supermarket（Riccarton）', '227 Blenheim Rd, Riccarton', -43.539, 172.607, '+64 3 348 1888', '9:00 AM - 8:00 PM', 4.5),
('Kosco Asian Supermarket Shirley', 'Kosco Asian Supermarket（Shirley）', '201 Marshland Rd, Shirley', -43.507, 172.693, '+64 3 385 1888', '9:00 AM - 8:00 PM', 4.3),
('Kosco Asian Supermarket Papanui', 'Kosco Asian Supermarket（Papanui）', '29 Main North Rd, Papanui', -43.5, 172.618, '+64 3 352 1888', '9:00 AM - 8:00 PM', 4.4),
('Kosco Asian Supermarket Riccarton 2', 'Kosco Asian Supermarket（Riccarton）', '92A Riccarton Rd, Riccarton', -43.53, 172.574, '+64 3 348 1889', '9:00 AM - 8:00 PM', 4.3),
('Ken''s Mart Asian Supermarket Sydenham', 'Ken''s Mart Asian Supermarket（Sydenham）', '290A Colombo St, Sydenham', -43.542, 172.639, '+64 3 366 1888', '9:00 AM - 8:00 PM', 4.2),
('Ken''s Mart Asian Supermarket Bryndwr', 'Ken''s Mart Asian Supermarket（Bryndwr）', '291 Wairakei Rd, Bryndwr', -43.509, 172.589, '+64 3 359 1888', '9:00 AM - 8:00 PM', 4.1),
('Basics Asian Supermarket Riccarton', '大华超市（Riccarton）', '8 Brake St, Upper Riccarton', -43.532, 172.57, '+64 3 348 2888', '9:00 AM - 8:00 PM', 4.3),
('China Town Market Riccarton', '华城超市（Riccarton）', '388 Riccarton Road, Upper Riccarton', -43.531, 172.585, '+64 3 348 2889', '9:00 AM - 8:00 PM', 4.4),
('Oriental Warehouse', '东方贸易', '317 Cashel St, Central City', -43.534, 172.646, '+64 3 366 3888', '9:00 AM - 7:00 PM', 4.2),
('Xinxing Asian Market', '新兴亚洲超市', '103 Riccarton Road, Riccarton', -43.528, 172.588, '+64 3 348 3889', '9:00 AM - 8:00 PM', 4.3),
('MetroMart City Oxford', 'MetroMart（City）', '32 Oxford Terrace, Central City', -43.531, 172.638, '+64 3 365 2888', '8:00 AM - 9:00 PM', 4.1),
('MetroMart City Durham', 'MetroMart（City）', '287-293 Durham St, Central City', -43.532, 172.633, '+64 3 365 2889', '8:00 AM - 9:00 PM', 4.0),
('MetroMart City Colombo', 'MetroMart（City）', '654 Colombo St, Central City', -43.539, 172.636, '+64 3 366 2888', '8:00 AM - 9:00 PM', 4.2),
('MetroMart Riccarton', 'MetroMart（Riccarton）', 'Kiosk 2, Bush Inn Mall, 20 Waimairi Rd, Upper Riccarton', -43.53, 172.574, '+64 3 348 2890', '8:00 AM - 9:00 PM', 4.1),
('MetroMart Addington', 'MetroMart（Addington）', '399 Lincoln Rd, Addington', -43.55, 172.616, '+64 3 338 2888', '8:00 AM - 9:00 PM', 4.0),
('MetroMart Halswell', 'MetroMart（Halswell）', '496 Sparks Rd, Halswell', -43.582, 172.574, '+64 3 322 2888', '8:00 AM - 9:00 PM', 4.1),
('MetroMart Redwood', 'MetroMart（Redwood）', '284 Main North Rd, Redwood', -43.496, 172.597, '+64 3 354 2888', '8:00 AM - 9:00 PM', 4.0),
('Krazy Price Mart Phillipstown', 'Krazy Price Mart（Phillipstown）', '431 Tuam St, Phillipstown', -43.535, 172.649, '+64 3 366 4888', '9:00 AM - 8:00 PM', 3.9),
('Big T Asian Supermarket Islington', 'Big T Asian Supermarket（Islington）', '21 Foremans Rd, Islington', -43.537, 172.518, '+64 3 349 1888', '9:00 AM - 8:00 PM', 4.2);

-- 重新启用外键约束检查
SET session_replication_role = DEFAULT;

-- 更新序列值
SELECT setval('supermarkets_id_seq', (SELECT MAX(id) FROM supermarkets));

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_supermarkets_location ON supermarkets(location);
CREATE INDEX IF NOT EXISTS idx_supermarkets_coordinates ON supermarkets(latitude, longitude);


