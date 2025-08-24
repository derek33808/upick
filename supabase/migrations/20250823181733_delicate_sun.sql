/*
  # Fix RLS Policy for User Profile Creation

  1. Problem
    - RLS policy prevents new user profile insertion
    - Error: "new row violates row-level security policy for table users"
    - Users cannot register because profile creation fails

  2. Solution
    - Add RLS policy to allow authenticated users to insert their own profile
    - Policy checks that auth.uid() matches the user id being inserted

  3. Changes
    - Drop existing conflicting policies
    - Create new INSERT policy for user profile creation
    - Ensure other policies remain intact
*/

-- Drop any existing conflicting INSERT policies
DROP POLICY IF EXISTS "Enable insert for system during registration" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Allow authenticated users to insert own profile" ON public.users;

-- Create the correct INSERT policy for user registration
CREATE POLICY "Users can insert own profile"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Ensure RLS is enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Verify the policy was created
DO $$
BEGIN
  RAISE NOTICE 'RLS policy for user profile creation has been fixed';
END $$;