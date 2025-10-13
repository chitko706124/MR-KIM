/*
  # Initial Database Schema for GameHub

  ## Tables Created:
  1. `accounts` - Game account listings
     - `id` (uuid, primary key)  
     - `title` (text, account title)
     - `description` (text, account description)
     - `price` (numeric, account price)
     - `discount` (numeric, optional discount percentage)
     - `category` (text, mobile_legend or pubg)
     - `collector_level` (text, optional ML collector level)
     - `images` (text[], array of image URLs)
     - `is_sold` (boolean, sold status)
     - `sold_at` (timestamptz, when marked as sold)
     - `created_at` (timestamptz, creation time)
     - `updated_at` (timestamptz, last update time)

  2. `ads` - Advertisement banners
     - `id` (uuid, primary key)
     - `image_url` (text, ad image URL)
     - `title` (text, optional ad title)
     - `link` (text, optional click link)
     - `order_index` (integer, display order)
     - `is_active` (boolean, active status)
     - `created_at` (timestamptz, creation time)

  3. `admin_users` - Admin authentication
     - `id` (uuid, primary key)
     - `email` (text, admin email)
     - `password_hash` (text, hashed password)
     - `created_at` (timestamptz, creation time)

  ## Security
  - Enable RLS on all tables
  - Add policies for public read access on accounts and ads
  - Add policies for authenticated admin access on admin functions
*/

-- Create accounts table
CREATE TABLE IF NOT EXISTS accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  price numeric(10,2) NOT NULL,
  discount numeric(5,2) DEFAULT NULL,
  category text NOT NULL CHECK (category IN ('mobile_legend', 'pubg')),
  collector_level text DEFAULT NULL,
  images text[] DEFAULT '{}',
  is_sold boolean DEFAULT false,
  sold_at timestamptz DEFAULT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create ads table
CREATE TABLE IF NOT EXISTS ads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  title text DEFAULT NULL,
  link text DEFAULT NULL,
  order_index integer NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Policies for accounts table
CREATE POLICY "Anyone can view accounts"
  ON accounts
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage accounts"
  ON accounts
  FOR ALL
  TO authenticated
  USING (true);

-- Policies for ads table
CREATE POLICY "Anyone can view active ads"
  ON ads
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage ads"
  ON ads
  FOR ALL
  TO authenticated
  USING (true);

-- Policies for admin_users table
CREATE POLICY "Authenticated users can view admin users"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage admin users"
  ON admin_users
  FOR ALL
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS accounts_category_idx ON accounts(category);
CREATE INDEX IF NOT EXISTS accounts_created_at_idx ON accounts(created_at DESC);
CREATE INDEX IF NOT EXISTS accounts_collector_level_idx ON accounts(collector_level);
CREATE INDEX IF NOT EXISTS ads_order_index_idx ON ads(order_index);
CREATE INDEX IF NOT EXISTS ads_is_active_idx ON ads(is_active);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at on accounts
CREATE TRIGGER update_accounts_updated_at 
    BEFORE UPDATE ON accounts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO accounts (title, description, price, discount, category, collector_level, images) VALUES
  ('Epic Mobile Legend Account - Mythic Rank', 'Premium ML account with mythic rank, 150+ heroes, rare skins including KOF and Transformer series. Perfect for serious players.', 299.99, 15, 'mobile_legend', 'Legendary Collector', ARRAY['https://images.pexels.com/photos/735911/pexels-photo-735911.jpeg?auto=compress&cs=tinysrgb&w=800']),
  ('Pro PUBG Mobile Account - Conqueror', 'High-tier PUBG Mobile account with Conqueror rank, exclusive outfits, rare weapon skins, and premium vehicle skins.', 199.99, NULL, 'pubg', NULL, ARRAY['https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=800']),
  ('Mobile Legend Starter Pack', 'Great beginner account with 50+ heroes unlocked, premium skins, and Epic rank. Perfect for starting your ML journey.', 89.99, 20, 'mobile_legend', 'Expert Collector', ARRAY['https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=800']),
  ('PUBG Crown Tier Account', 'Well-maintained PUBG account with Crown rank, multiple rare skins, and premium battle pass rewards.', 149.99, 10, 'pubg', NULL, ARRAY['https://images.pexels.com/photos/1293261/pexels-photo-1293261.jpeg?auto=compress&cs=tinysrgb&w=800']);

INSERT INTO ads (image_url, title, order_index) VALUES
  ('https://images.pexels.com/photos/275033/pexels-photo-275033.jpeg?auto=compress&cs=tinysrgb&w=1920', 'Premium Gaming Accounts Sale', 1),
  ('https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=1920', 'Mobile Legend Special Offers', 2);

-- Create default admin user (password: 'admin123' - should be changed in production)
INSERT INTO admin_users (email, password_hash) VALUES
  ('admin@gamehub.com', '$2b$10$rHzZPjr8xqdo5w3DvNs2JuX.m1ZNQFW7Qgj1SXHVL9eVkJ2iHJGa6');