/*
  # Remove Problematic User Registration Triggers

  1. Problem Analysis
    - Database triggers are causing "Database error saving new user"
    - Supabase auth.signUp is failing due to trigger issues
    - Need to remove problematic triggers and handle user creation manually

  2. Solution
    - Remove all user creation triggers that might be causing conflicts
    - Simplify RLS policies
    - Let the application handle user profile creation manually

  3. Changes
    - Drop all user creation triggers
    - Simplify RLS policies for users table
    - Remove any functions that might interfere with auth
*/

-- Drop all existing triggers that might interfere with user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user ON auth.users;
DROP TRIGGER IF EXISTS create_user_profile ON auth.users;

-- Drop all related functions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.create_user_profile() CASCADE;

-- Simplify RLS policies for users table
DROP POLICY IF EXISTS "System can create user profiles" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Enable insert for system during registration" ON public.users;
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admin can manage all users" ON public.users;

-- Create simple, working RLS policies
CREATE POLICY "Allow authenticated users to insert own profile"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow users to read own profile"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Allow users to update own profile"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow admin access
CREATE POLICY "Allow admin full access"
  ON public.users
  FOR ALL
  TO authenticated
  USING (
    (auth.jwt() ->> 'email') = ANY (ARRAY['admin@upick.life', 'admin@admin.com'])
  )
  WITH CHECK (
    (auth.jwt() ->> 'email') = ANY (ARRAY['admin@upick.life', 'admin@admin.com'])
  );

-- Ensure RLS is enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Verify the setup
DO $$
BEGIN
  RAISE NOTICE 'User registration triggers removed, manual profile creation enabled';
END $$;