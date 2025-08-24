/*
  # 修复用户注册RLS策略

  1. 安全策略修复
    - 删除冲突的用户表INSERT策略
    - 创建正确的用户注册策略
    - 允许认证用户创建自己的资料

  2. 用户收藏表策略
    - 修复用户收藏表的RLS策略
    - 允许用户管理自己的收藏

  3. 购物车表策略
    - 确保购物车表有正确的RLS策略
*/

-- 1. 修复用户表的RLS策略
-- 删除可能冲突的INSERT策略
DROP POLICY IF EXISTS "Users can create own profile" ON users;
DROP POLICY IF EXISTS "Allow users to create own profile" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON users;

-- 创建新的INSERT策略，允许认证用户创建自己的资料
CREATE POLICY "Allow authenticated users to create own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 确保其他策略存在
DO $$
BEGIN
  -- 检查并创建SELECT策略
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND policyname = 'Allow users to read own profile'
  ) THEN
    CREATE POLICY "Allow users to read own profile"
      ON users
      FOR SELECT
      TO authenticated
      USING (auth.uid() = id);
  END IF;

  -- 检查并创建UPDATE策略
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND policyname = 'Allow users to update own profile'
  ) THEN
    CREATE POLICY "Allow users to update own profile"
      ON users
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- 2. 修复用户收藏表的RLS策略
-- 删除可能冲突的策略
DROP POLICY IF EXISTS "Users can insert own favorites" ON user_favorites;
DROP POLICY IF EXISTS "Users can read own favorites" ON user_favorites;
DROP POLICY IF EXISTS "Users can delete own favorites" ON user_favorites;

-- 创建正确的用户收藏策略
CREATE POLICY "Allow users to manage own favorites"
  ON user_favorites
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. 确保购物车表有正确的RLS策略
-- 删除可能冲突的策略
DROP POLICY IF EXISTS "Users can manage own shopping cart" ON shopping_cart;

-- 创建购物车管理策略
CREATE POLICY "Allow users to manage own shopping cart"
  ON shopping_cart
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 确保所有表都启用了RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_cart ENABLE ROW LEVEL SECURITY;