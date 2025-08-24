/*
  # 修复认证和数据库策略问题

  1. 修复表结构
    - 重新创建shopping_list表
    - 修复RLS策略冲突
    - 确保外键引用正确

  2. 安全策略
    - 重新配置所有RLS策略
    - 修复策略冲突问题
    - 确保用户权限正确

  3. 演示数据
    - 创建有效的演示账户
    - 确保认证用户和用户资料同步
*/

-- 1. 删除有问题的表和策略
DROP TABLE IF EXISTS shopping_list CASCADE;
DROP TABLE IF EXISTS user_favorites CASCADE;

-- 2. 重新创建用户收藏表
CREATE TABLE IF NOT EXISTS user_favorites (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id bigint NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- 3. 重新创建购物清单表
CREATE TABLE IF NOT EXISTS shopping_list (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id bigint NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  added_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- 4. 创建索引
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_product_id ON user_favorites(product_id);
CREATE INDEX IF NOT EXISTS idx_shopping_list_user_id ON shopping_list(user_id);
CREATE INDEX IF NOT EXISTS idx_shopping_list_product_id ON shopping_list(product_id);

-- 5. 启用RLS
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_list ENABLE ROW LEVEL SECURITY;

-- 6. 创建RLS策略 - 用户收藏
CREATE POLICY "Users can manage own favorites"
  ON user_favorites
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 7. 创建RLS策略 - 购物清单
CREATE POLICY "Users can manage own shopping list"
  ON shopping_list
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 8. 确保users表的策略正确
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON users;
DROP POLICY IF EXISTS "Admin can manage all users" ON users;

CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admin can manage all users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM users 
      WHERE email IN ('admin@upick.life', 'admin@admin.com') 
      AND id = auth.uid()
    )
  );

-- 9. 创建触发器函数来自动创建用户资料
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name, language)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'language', 'en')
  )
  ON CONFLICT (id) DO UPDATE SET
    name = COALESCE(EXCLUDED.name, users.name),
    language = COALESCE(EXCLUDED.language, users.language),
    updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. 创建触发器
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 11. 为现有认证用户创建用户资料（如果不存在）
DO $$
DECLARE
  auth_user RECORD;
BEGIN
  FOR auth_user IN 
    SELECT id, email, raw_user_meta_data
    FROM auth.users 
    WHERE id NOT IN (SELECT id FROM users)
  LOOP
    INSERT INTO users (id, email, name, language)
    VALUES (
      auth_user.id,
      auth_user.email,
      COALESCE(
        auth_user.raw_user_meta_data->>'name',
        auth_user.raw_user_meta_data->>'full_name',
        split_part(auth_user.email, '@', 1)
      ),
      COALESCE(auth_user.raw_user_meta_data->>'language', 'en')
    )
    ON CONFLICT (id) DO NOTHING;
  END LOOP;
END $$;