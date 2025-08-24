/*
  # Create shopping list table

  1. New Tables
    - `shopping_list`
      - `id` (bigint, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `product_id` (bigint, foreign key to products)
      - `added_at` (timestamp)

  2. Security
    - Enable RLS on `shopping_list` table
    - Add policies for authenticated users to manage their own shopping list

  3. Constraints
    - Unique constraint on (user_id, product_id) to prevent duplicates
    - Foreign key constraints for data integrity
*/

CREATE TABLE IF NOT EXISTS shopping_list (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id bigint NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  added_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Enable RLS
ALTER TABLE shopping_list ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own shopping list"
  ON shopping_list
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own shopping list items"
  ON shopping_list
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own shopping list items"
  ON shopping_list
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_shopping_list_user_id ON shopping_list(user_id);
CREATE INDEX IF NOT EXISTS idx_shopping_list_product_id ON shopping_list(product_id);
CREATE INDEX IF NOT EXISTS idx_shopping_list_added_at ON shopping_list(added_at);