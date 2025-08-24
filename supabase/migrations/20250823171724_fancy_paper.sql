/*
  # Rebuild User Management System

  1. New Tables
    - `user_profiles` - User profile information
    - `user_watchlist` - Products user is watching for price changes
    - `shopping_cart` - User's shopping cart with quantities
    - `price_alerts` - Price change notifications for watched products
    - `shopping_routes` - Optimized shopping routes for users

  2. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users to manage their own data
    - Add policies for price alert system

  3. Functions
    - Auto-create user profile on signup
    - Calculate optimal shopping routes
    - Send price change notifications
*/

-- Drop existing conflicting tables and policies
DROP TABLE IF EXISTS user_favorites CASCADE;
DROP TABLE IF EXISTS shopping_list CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;

-- Create user profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  phone text,
  address text,
  city text DEFAULT 'Christchurch',
  postal_code text,
  preferred_language text DEFAULT 'en' CHECK (preferred_language IN ('en', 'zh')),
  notification_preferences jsonb DEFAULT '{"price_alerts": true, "weekly_deals": true, "route_updates": false}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user watchlist table (for price monitoring)
CREATE TABLE IF NOT EXISTS user_watchlist (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id bigint NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  target_price numeric(10,2), -- User's desired price point
  alert_enabled boolean DEFAULT true,
  added_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Create shopping cart table
CREATE TABLE IF NOT EXISTS shopping_cart (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id bigint NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  preferred_supermarket_id bigint REFERENCES supermarkets(id),
  notes text,
  added_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Create price alerts table
CREATE TABLE IF NOT EXISTS price_alerts (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id bigint NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  old_price numeric(10,2) NOT NULL,
  new_price numeric(10,2) NOT NULL,
  price_change_percentage numeric(5,2),
  alert_type text NOT NULL CHECK (alert_type IN ('price_drop', 'price_increase', 'target_reached')),
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create shopping routes table
CREATE TABLE IF NOT EXISTS shopping_routes (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  route_name text NOT NULL,
  total_estimated_cost numeric(10,2),
  total_estimated_time_minutes integer,
  supermarket_order jsonb NOT NULL, -- Array of supermarket IDs in optimal order
  product_distribution jsonb NOT NULL, -- Which products to buy at which supermarket
  route_notes text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_routes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for user_watchlist
CREATE POLICY "Users can manage own watchlist"
  ON user_watchlist
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for shopping_cart
CREATE POLICY "Users can manage own shopping cart"
  ON shopping_cart
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for price_alerts
CREATE POLICY "Users can read own price alerts"
  ON price_alerts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can create price alerts"
  ON price_alerts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own price alerts"
  ON price_alerts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for shopping_routes
CREATE POLICY "Users can manage own shopping routes"
  ON shopping_routes
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_watchlist_user_id ON user_watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_user_watchlist_product_id ON user_watchlist(product_id);
CREATE INDEX IF NOT EXISTS idx_shopping_cart_user_id ON shopping_cart(user_id);
CREATE INDEX IF NOT EXISTS idx_shopping_cart_product_id ON shopping_cart(product_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_user_id ON price_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_product_id ON price_alerts(product_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_created_at ON price_alerts(created_at);
CREATE INDEX IF NOT EXISTS idx_shopping_routes_user_id ON shopping_routes(user_id);

-- Create function to auto-create user profile
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-create user profile
DROP TRIGGER IF EXISTS create_user_profile_trigger ON auth.users;
CREATE TRIGGER create_user_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile();

-- Create function to calculate optimal shopping route
CREATE OR REPLACE FUNCTION calculate_optimal_route(user_cart_id uuid)
RETURNS jsonb AS $$
DECLARE
  route_data jsonb;
  supermarket_products jsonb;
  total_cost numeric := 0;
  estimated_time integer := 0;
BEGIN
  -- Get all products in user's cart with their cheapest supermarket
  WITH cart_products AS (
    SELECT 
      sc.product_id,
      sc.quantity,
      p.name_en,
      p.price,
      p.supermarket_id,
      s.name_en as supermarket_name,
      s.latitude,
      s.longitude
    FROM shopping_cart sc
    JOIN products p ON sc.product_id = p.id
    JOIN supermarkets s ON p.supermarket_id = s.id
    WHERE sc.user_id = user_cart_id
  ),
  cheapest_products AS (
    SELECT DISTINCT ON (cp.product_id)
      cp.product_id,
      cp.quantity,
      cp.name_en,
      cp.price,
      cp.supermarket_id,
      cp.supermarket_name,
      cp.latitude,
      cp.longitude,
      (cp.price * cp.quantity) as total_product_cost
    FROM cart_products cp
    ORDER BY cp.product_id, cp.price ASC
  )
  SELECT 
    jsonb_build_object(
      'supermarkets', jsonb_agg(DISTINCT jsonb_build_object(
        'id', supermarket_id,
        'name', supermarket_name,
        'latitude', latitude,
        'longitude', longitude
      )),
      'products_by_supermarket', jsonb_object_agg(
        supermarket_id::text,
        jsonb_agg(jsonb_build_object(
          'product_id', product_id,
          'name', name_en,
          'quantity', quantity,
          'price', price,
          'total_cost', total_product_cost
        ))
      ),
      'total_cost', sum(total_product_cost),
      'estimated_time', count(DISTINCT supermarket_id) * 15 -- 15 minutes per store
    )
  INTO route_data
  FROM cheapest_products;

  RETURN COALESCE(route_data, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to send price alerts
CREATE OR REPLACE FUNCTION check_price_changes()
RETURNS void AS $$
DECLARE
  watchlist_item RECORD;
  current_price numeric;
  price_change numeric;
BEGIN
  -- Check all watchlist items for price changes
  FOR watchlist_item IN 
    SELECT w.*, p.price as current_price, ph.price as last_recorded_price
    FROM user_watchlist w
    JOIN products p ON w.product_id = p.id
    LEFT JOIN LATERAL (
      SELECT price 
      FROM price_history 
      WHERE product_id = w.product_id 
      ORDER BY recorded_at DESC 
      LIMIT 1
    ) ph ON true
    WHERE w.alert_enabled = true
  LOOP
    -- Calculate price change percentage
    IF watchlist_item.last_recorded_price IS NOT NULL THEN
      price_change := ((watchlist_item.current_price - watchlist_item.last_recorded_price) / watchlist_item.last_recorded_price) * 100;
      
      -- Create alert for significant price changes (>5% change)
      IF ABS(price_change) >= 5 THEN
        INSERT INTO price_alerts (user_id, product_id, old_price, new_price, price_change_percentage, alert_type)
        VALUES (
          watchlist_item.user_id,
          watchlist_item.product_id,
          watchlist_item.last_recorded_price,
          watchlist_item.current_price,
          price_change,
          CASE 
            WHEN price_change < 0 THEN 'price_drop'
            ELSE 'price_increase'
          END
        );
      END IF;
    END IF;
    
    -- Check if target price is reached
    IF watchlist_item.target_price IS NOT NULL AND watchlist_item.current_price <= watchlist_item.target_price THEN
      INSERT INTO price_alerts (user_id, product_id, old_price, new_price, alert_type)
      VALUES (
        watchlist_item.user_id,
        watchlist_item.product_id,
        watchlist_item.current_price,
        watchlist_item.target_price,
        'target_reached'
      );
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;