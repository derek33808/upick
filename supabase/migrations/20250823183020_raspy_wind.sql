/*
  # Fix RLS policies for user_favorites table

  1. Problem
    - RLS policy prevents users from inserting into user_favorites table
    - Error: "new row violates row-level security policy for table user_favorites"

  2. Solution
    - Create proper RLS policies for user_favorites table
    - Allow users to manage their own favorites

  3. Changes
    - Drop existing conflicting policies
    - Create INSERT, SELECT, DELETE policies for user_favorites
    - Ensure users can only access their own favorites
*/

-- Enable RLS on user_favorites table
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can manage own favorites" ON public.user_favorites;
DROP POLICY IF EXISTS "Users can insert own favorites" ON public.user_favorites;
DROP POLICY IF EXISTS "Users can read own favorites" ON public.user_favorites;
DROP POLICY IF EXISTS "Users can delete own favorites" ON public.user_favorites;

-- Create INSERT policy for user_favorites
CREATE POLICY "Users can insert own favorites"
  ON public.user_favorites
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create SELECT policy for user_favorites
CREATE POLICY "Users can read own favorites"
  ON public.user_favorites
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create DELETE policy for user_favorites
CREATE POLICY "Users can delete own favorites"
  ON public.user_favorites
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Verify the policies were created
DO $$
BEGIN
  RAISE NOTICE 'RLS policies for user_favorites table have been created';
END $$;