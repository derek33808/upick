/*
  # 创建管理员用户和修复认证问题

  1. 新增功能
    - 创建默认管理员账户
    - 修复用户表结构
    - 确保认证流程正常工作

  2. 安全设置
    - 更新RLS策略
    - 确保管理员权限正确设置
*/

-- 确保用户表存在且结构正确
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  phone text,
  region text,
  language text DEFAULT 'en' CHECK (language IN ('en', 'zh')),
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_login_at timestamptz
);

-- 启用RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 删除所有现有的用户策略
DROP POLICY IF EXISTS "Allow all insert" ON users;
DROP POLICY IF EXISTS "Allow all read" ON users;
DROP POLICY IF EXISTS "Allow insert for all" ON users;
DROP POLICY IF EXISTS "Allow insert for authenticated" ON users;
DROP POLICY IF EXISTS "Allow public read" ON users;
DROP POLICY IF EXISTS "Allow read access to all" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Admins can delete users" ON users;
DROP POLICY IF EXISTS "Admins can read all users" ON users;

-- 创建新的用户策略
CREATE POLICY "Enable insert for authentication users only" ON users
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- 管理员策略
CREATE POLICY "Admins can read all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.email IN ('admin@upick.life', 'admin@admin.com')
    )
  );

CREATE POLICY "Admins can delete users" ON users
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.email IN ('admin@upick.life', 'admin@admin.com')
    )
    AND id != auth.uid()
  );

-- 创建或更新updated_at触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 创建触发器
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 插入默认管理员用户（如果不存在）
DO $$
BEGIN
  -- 检查是否已存在管理员用户
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@upick.life') THEN
    INSERT INTO users (
      id,
      email,
      name,
      phone,
      region,
      language,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      'admin@upick.life',
      'Administrator',
      '+64 21 123 4567',
      'Christchurch',
      'en',
      now(),
      now()
    );
    
    RAISE NOTICE '✅ 管理员账户已创建: admin@upick.life';
  ELSE
    RAISE NOTICE '📋 管理员账户已存在';
  END IF;
END $$;