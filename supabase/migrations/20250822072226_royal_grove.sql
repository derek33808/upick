/*
  # Fix RLS policies to prevent infinite recursion

  1. Security
    - Drop existing problematic policies that cause infinite recursion
    - Create simple, non-recursive policies for users table
    - Ensure policies don't reference the same table they're protecting

  2. Changes
    - Remove complex policies that query users table within user policies
    - Add straightforward policies using auth.uid() directly
    - Enable proper access control without recursion
*/

-- Drop all existing policies on users table to start fresh
DROP POLICY IF EXISTS "Admins can delete users" ON users;
DROP POLICY IF EXISTS "Admins can read all users" ON users;
DROP POLICY IF EXISTS "Enable insert for authentication users only" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;

-- Create simple, non-recursive policies
CREATE POLICY "Users can view own profile"
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

-- Simple admin policy without subqueries
CREATE POLICY "Admin can manage all users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM users 
      WHERE email = 'admin@upick.life' 
      AND id = auth.uid()
    )
  );