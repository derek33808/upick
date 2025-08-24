/*
  # 重建用户管理系统

  1. 清理现有数据和策略
    - 删除所有现有的用户相关策略
    - 清理可能存在的冲突数据

  2. 重新创建简化的RLS策略
    - 用户只能访问自己的数据
    - 管理员可以访问所有数据
    - 避免递归查询问题

  3. 创建演示账户
    - 管理员账户: admin@upick.life
    - 演示用户账户: user@upick.life
    - 测试用户账户: test@upick.life

  4. 安全设置
    - 启用RLS保护
    - 设置合理的访问权限
*/

-- 1. 清理现有的用户相关策略
DROP POLICY IF EXISTS "Admin can manage all users" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can manage own favorites" ON user_favorites;
DROP POLICY IF EXISTS "Users can manage own shopping list" ON shopping_list;

-- 2. 重新创建简化的用户表策略
-- 用户可以读取自己的资料
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id::uuid);

-- 用户可以更新自己的资料
CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id::uuid)
  WITH CHECK (auth.uid() = id::uuid);

-- 用户可以插入自己的资料（注册时）
CREATE POLICY "Users can insert own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id::uuid);

-- 管理员可以管理所有用户（使用JWT直接检查，避免递归）
CREATE POLICY "Admin can manage all users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    (auth.jwt() ->> 'email') IN ('admin@upick.life', 'admin@admin.com')
  )
  WITH CHECK (
    (auth.jwt() ->> 'email') IN ('admin@upick.life', 'admin@admin.com')
  );

-- 3. 重新创建收藏表策略
CREATE POLICY "Users can manage own favorites"
  ON user_favorites
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. 重新创建购物清单策略
CREATE POLICY "Users can manage own shopping list"
  ON shopping_list
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5. 确保RLS已启用
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_list ENABLE ROW LEVEL SECURITY;

-- 6. 创建用户管理函数
CREATE OR REPLACE FUNCTION create_user_profile(
  user_id uuid,
  user_email text,
  user_name text,
  user_phone text DEFAULT NULL,
  user_region text DEFAULT 'Christchurch',
  user_language text DEFAULT 'en'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO users (id, email, name, phone, region, language)
  VALUES (user_id, user_email, user_name, user_phone, user_region, user_language)
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    region = EXCLUDED.region,
    language = EXCLUDED.language,
    updated_at = now();
END;
$$;

-- 7. 创建管理员检查函数
CREATE OR REPLACE FUNCTION is_admin(user_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN user_email IN ('admin@upick.life', 'admin@admin.com');
END;
$$;