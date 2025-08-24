/*
  # Fix infinite recursion in users table RLS policies

  1. Problem
    - Current RLS policies on users table are causing infinite recursion
    - This affects all queries to users, supermarkets, and products tables
    - Error: "infinite recursion detected in policy for relation users"

  2. Solution
    - Drop all existing problematic policies on users table
    - Create simple, non-recursive policies
    - Use auth.uid() directly instead of complex subqueries
    - Ensure policies don't reference the users table itself

  3. New Policies
    - Users can read their own profile using auth.uid()
    - Users can update their own profile using auth.uid()
    - Authenticated users can insert their own profile
    - Admin users can manage all profiles (simplified check)
*/

-- Drop all existing policies on users table to fix recursion
DROP POLICY IF EXISTS "Admin can manage all users" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.users;
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;

-- Create simple, non-recursive policies
CREATE POLICY "Users can read own profile"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Simple admin policy without recursion
CREATE POLICY "Admin can manage all users"
  ON public.users
  FOR ALL
  TO authenticated
  USING (
    auth.jwt() ->> 'email' IN ('admin@upick.life', 'admin@admin.com')
  )
  WITH CHECK (
    auth.jwt() ->> 'email' IN ('admin@upick.life', 'admin@admin.com')
  );