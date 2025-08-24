/*
  # Fix user creation triggers and policies

  1. Database Functions
    - Update handle_new_user function to handle errors gracefully
    - Ensure proper user profile creation

  2. Security
    - Fix RLS policies for user creation
    - Allow authenticated users to create their own profiles

  3. Triggers
    - Update triggers to handle edge cases
    - Add error handling for profile creation
*/

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Create improved handle_new_user function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into users table with error handling
  BEGIN
    INSERT INTO public.users (
      id,
      email,
      name,
      phone,
      region,
      language,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
      NEW.raw_user_meta_data->>'phone',
      COALESCE(NEW.raw_user_meta_data->>'city', NEW.raw_user_meta_data->>'region', 'Christchurch'),
      COALESCE(NEW.raw_user_meta_data->>'preferred_language', NEW.raw_user_meta_data->>'language', 'en'),
      NOW(),
      NOW()
    );
  EXCEPTION
    WHEN unique_violation THEN
      -- User already exists, update instead
      UPDATE public.users SET
        name = COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', name),
        phone = COALESCE(NEW.raw_user_meta_data->>'phone', phone),
        region = COALESCE(NEW.raw_user_meta_data->>'city', NEW.raw_user_meta_data->>'region', region),
        language = COALESCE(NEW.raw_user_meta_data->>'preferred_language', NEW.raw_user_meta_data->>'language', language),
        updated_at = NOW()
      WHERE id = NEW.id;
    WHEN OTHERS THEN
      -- Log error but don't fail the auth process
      RAISE WARNING 'Failed to create user profile for %: %', NEW.email, SQLERRM;
  END;

  -- Also try to insert into user_profiles if it exists
  BEGIN
    INSERT INTO public.user_profiles (
      id,
      email,
      full_name,
      phone,
      city,
      preferred_language,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
      NEW.raw_user_meta_data->>'phone',
      COALESCE(NEW.raw_user_meta_data->>'city', NEW.raw_user_meta_data->>'region', 'Christchurch'),
      COALESCE(NEW.raw_user_meta_data->>'preferred_language', NEW.raw_user_meta_data->>'language', 'en'),
      NOW(),
      NOW()
    );
  EXCEPTION
    WHEN undefined_table THEN
      -- user_profiles table doesn't exist, skip
      NULL;
    WHEN unique_violation THEN
      -- Profile already exists, update instead
      UPDATE public.user_profiles SET
        full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', full_name),
        phone = COALESCE(NEW.raw_user_meta_data->>'phone', phone),
        city = COALESCE(NEW.raw_user_meta_data->>'city', NEW.raw_user_meta_data->>'region', city),
        preferred_language = COALESCE(NEW.raw_user_meta_data->>'preferred_language', NEW.raw_user_meta_data->>'language', preferred_language),
        updated_at = NOW()
      WHERE id = NEW.id;
    WHEN OTHERS THEN
      -- Log error but don't fail the auth process
      RAISE WARNING 'Failed to create user_profiles for %: %', NEW.email, SQLERRM;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update RLS policies for users table to allow inserts during registration
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
CREATE POLICY "Users can insert own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Add policy to allow the trigger function to insert
DROP POLICY IF EXISTS "System can create user profiles" ON users;
CREATE POLICY "System can create user profiles"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Update RLS policies for user_profiles table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
    -- Drop existing policies
    DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
    DROP POLICY IF EXISTS "System can create user profiles" ON user_profiles;
    
    -- Create new policies
    CREATE POLICY "Users can insert own profile"
      ON user_profiles
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = id);
      
    CREATE POLICY "System can create user profiles"
      ON user_profiles
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;