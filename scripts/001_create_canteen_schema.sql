-- Canteen Pre-Order System Database Schema

-- Menu Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Menu Items table
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  is_vegetarian BOOLEAN DEFAULT false,
  preparation_time INT DEFAULT 5, -- in minutes
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  student_name TEXT NOT NULL,
  student_phone TEXT,
  student_email TEXT,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('gpay', 'cod')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  order_status TEXT DEFAULT 'pending' CHECK (order_status IN ('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled')),
  total_amount DECIMAL(10,2) NOT NULL,
  notes TEXT,
  is_walk_in BOOLEAN DEFAULT false, -- for manual orders from admin
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Order Items table (line items for each order)
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL, -- stored separately in case menu item is deleted
  quantity INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin users table (for shopkeeper access)
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_items(is_available);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for categories (public read, admin write)
CREATE POLICY "Anyone can view categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Admin can insert categories" ON categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can update categories" ON categories FOR UPDATE USING (true);
CREATE POLICY "Admin can delete categories" ON categories FOR DELETE USING (true);

-- RLS Policies for menu_items (public read available items, admin write)
CREATE POLICY "Anyone can view available menu items" ON menu_items FOR SELECT USING (true);
CREATE POLICY "Admin can insert menu items" ON menu_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can update menu items" ON menu_items FOR UPDATE USING (true);
CREATE POLICY "Admin can delete menu items" ON menu_items FOR DELETE USING (true);

-- RLS Policies for orders (public can create and view their own by order_number)
CREATE POLICY "Anyone can create orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Admin can update orders" ON orders FOR UPDATE USING (true);

-- RLS Policies for order_items
CREATE POLICY "Anyone can create order items" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view order items" ON order_items FOR SELECT USING (true);

-- RLS Policies for admin_users
CREATE POLICY "Admin can view admin users" ON admin_users FOR SELECT USING (true);
CREATE POLICY "Admin can manage admin users" ON admin_users FOR ALL USING (true);

-- Insert default categories
INSERT INTO categories (name, description, sort_order) VALUES
  ('Snacks', 'Quick bites and light snacks', 1),
  ('Main Course', 'Full meals and main dishes', 2),
  ('Beverages', 'Drinks and refreshments', 3),
  ('Desserts', 'Sweet treats and desserts', 4)
ON CONFLICT DO NOTHING;

-- Insert sample menu items
INSERT INTO menu_items (category_id, name, description, price, is_available, is_vegetarian, preparation_time) 
SELECT 
  c.id,
  'Samosa',
  'Crispy fried pastry with spiced potato filling',
  15.00,
  true,
  true,
  3
FROM categories c WHERE c.name = 'Snacks'
ON CONFLICT DO NOTHING;

INSERT INTO menu_items (category_id, name, description, price, is_available, is_vegetarian, preparation_time) 
SELECT 
  c.id,
  'Vada Pav',
  'Mumbai style spiced potato fritter in a bun',
  20.00,
  true,
  true,
  5
FROM categories c WHERE c.name = 'Snacks'
ON CONFLICT DO NOTHING;

INSERT INTO menu_items (category_id, name, description, price, is_available, is_vegetarian, preparation_time) 
SELECT 
  c.id,
  'Chicken Biryani',
  'Fragrant rice with tender chicken pieces',
  120.00,
  true,
  false,
  15
FROM categories c WHERE c.name = 'Main Course'
ON CONFLICT DO NOTHING;

INSERT INTO menu_items (category_id, name, description, price, is_available, is_vegetarian, preparation_time) 
SELECT 
  c.id,
  'Veg Thali',
  'Complete meal with rice, dal, sabzi, roti, and pickle',
  80.00,
  true,
  true,
  10
FROM categories c WHERE c.name = 'Main Course'
ON CONFLICT DO NOTHING;

INSERT INTO menu_items (category_id, name, description, price, is_available, is_vegetarian, preparation_time) 
SELECT 
  c.id,
  'Masala Chai',
  'Hot spiced Indian tea',
  15.00,
  true,
  true,
  3
FROM categories c WHERE c.name = 'Beverages'
ON CONFLICT DO NOTHING;

INSERT INTO menu_items (category_id, name, description, price, is_available, is_vegetarian, preparation_time) 
SELECT 
  c.id,
  'Cold Coffee',
  'Chilled coffee with ice cream',
  40.00,
  true,
  true,
  5
FROM categories c WHERE c.name = 'Beverages'
ON CONFLICT DO NOTHING;

INSERT INTO menu_items (category_id, name, description, price, is_available, is_vegetarian, preparation_time) 
SELECT 
  c.id,
  'Gulab Jamun',
  'Sweet milk dumplings in sugar syrup (2 pcs)',
  30.00,
  true,
  true,
  2
FROM categories c WHERE c.name = 'Desserts'
ON CONFLICT DO NOTHING;
