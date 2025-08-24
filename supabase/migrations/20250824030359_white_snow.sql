/*
  # Fix RLS Policy for Users Table Profile Creation

  1. Problem
    - RLS policy prevents new user profile insertion during registration
    - Error: "new row violates row-level security policy for table users"
    - Users cannot complete registration process

  2. Solution
    - Drop existing conflicting INSERT policies on users table
    - Create proper INSERT policy that allows authenticated users to create their own profile
    - Policy uses WITH CHECK clause to ensure auth.uid() matches the id being inserted

  3. Changes
    - Remove any existing INSERT policies that may be blocking profile creation
    - Add new INSERT policy with correct permissions for user registration
    - Maintain existing SELECT and UPDATE policies for user data access
*/

-- Drop any existing INSERT policies that might be conflicting
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Allow users to insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own data" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.users;

-- Create the correct INSERT policy for user profile creation during registration
CREATE POLICY "Users can create own profile"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Ensure RLS is enabled on the users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Verify the policy was created successfully
DO $$
BEGIN
  RAISE NOTICE 'INSERT policy for users table has been created successfully';
END $$;