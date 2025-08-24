/*
  # Fix Shopping Cart RLS Policies

  1. Security
    - Drop existing conflicting policies on shopping_cart table
    - Create proper RLS policies for authenticated users to manage their own shopping cart items
    - Allow INSERT, SELECT, UPDATE, DELETE operations where user_id matches auth.uid()

  2. Changes
    - Enable RLS on shopping_cart table
    - Add policy for users to manage their own shopping cart items
*/

-- Enable RLS on shopping_cart table
ALTER TABLE shopping_cart ENABLE ROW LEVEL SECURITY;

-- Drop existing policies that might be conflicting
DROP POLICY IF EXISTS "Allow users to manage own shopping cart" ON shopping_cart;
DROP POLICY IF EXISTS "Users can manage own shopping cart" ON shopping_cart;

-- Create comprehensive policy for shopping cart management
CREATE POLICY "Users can manage own shopping cart"
  ON shopping_cart
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);