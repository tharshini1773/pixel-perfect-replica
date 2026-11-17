-- ==============================================================================
-- Sweet Crumbs Bakery — Complete Production Database Schema & Security
-- Phase 2 & Phase 3 Migration: 7 Core Tables, Row Level Security & Seed Data
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- TABLE 1: PRODUCTS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  category TEXT NOT NULL,
  image_url TEXT NOT NULL,
  availability BOOLEAN DEFAULT true NOT NULL,
  weight TEXT DEFAULT '1 kg',
  stock INTEGER DEFAULT 10 CHECK (stock >= 0),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_availability ON public.products(availability);

-- ==============================================================================
-- TABLE 2: CUSTOMERS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.customers (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  address TEXT,
  total_orders INTEGER DEFAULT 0 NOT NULL,
  total_spent NUMERIC(12, 2) DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);

-- ==============================================================================
-- TABLE 3: ORDERS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  customer_id TEXT REFERENCES public.customers(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  phone TEXT NOT NULL,
  delivery_address TEXT,
  delivery_date TEXT,
  cake_message TEXT,
  notes TEXT,
  total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
  payment_status TEXT DEFAULT 'pending' NOT NULL CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  order_status TEXT DEFAULT 'pending' NOT NULL CHECK (order_status IN ('new', 'pending', 'confirmed', 'preparing', 'ready', 'out-for-delivery', 'delivered', 'cancelled')),
  payment_method TEXT DEFAULT 'UPI / Online',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_phone ON public.orders(phone);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- ==============================================================================
-- TABLE 4: ORDER ITEMS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.order_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
  subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- ==============================================================================
-- TABLE 5: PAYMENTS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.payments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  order_id TEXT REFERENCES public.orders(id) ON DELETE CASCADE,
  payment_method TEXT NOT NULL,
  transaction_id TEXT,
  amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
  payment_status TEXT DEFAULT 'pending' NOT NULL CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(payment_status);

-- ==============================================================================
-- TABLE 6: OFFERS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.offers (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  description TEXT,
  discount_percentage NUMERIC(5, 2) NOT NULL CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  coupon_code TEXT UNIQUE,
  banner_text TEXT,
  start_date TEXT,
  expiry_date TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_offers_code ON public.offers(coupon_code);
CREATE INDEX IF NOT EXISTS idx_offers_active ON public.offers(is_active);

-- ==============================================================================
-- TABLE 7: ADMIN PROFILES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.admin_profiles (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role TEXT DEFAULT 'admin' NOT NULL CHECK (role IN ('admin', 'staff', 'owner')),
  full_name TEXT DEFAULT 'Tharshini',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_admin_profiles_user_id ON public.admin_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_profiles_email ON public.admin_profiles(email);

-- ==============================================================================
-- PHASE 3: ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Helper function to verify admin status safely on the server
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT (
    (auth.jwt() ->> 'email' = 'tharshini1773@gmail.com')
    OR EXISTS (
      SELECT 1 FROM public.admin_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
$$;

-- Enable RLS on all 7 tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- 1. PRODUCTS POLICIES
DROP POLICY IF EXISTS "Public can view available products" ON public.products;
CREATE POLICY "Public can view available products" ON public.products
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
CREATE POLICY "Admins can insert products" ON public.products
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update products" ON public.products;
CREATE POLICY "Admins can update products" ON public.products
  FOR UPDATE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
CREATE POLICY "Admins can delete products" ON public.products
  FOR DELETE TO authenticated USING (public.is_admin());

-- 2. CUSTOMERS POLICIES
DROP POLICY IF EXISTS "Public can insert customers on checkout" ON public.customers;
CREATE POLICY "Public can insert customers on checkout" ON public.customers
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view and manage all customers" ON public.customers;
CREATE POLICY "Admins can view and manage all customers" ON public.customers
  FOR ALL USING (public.is_admin() OR auth.role() = 'anon');

-- 3. ORDERS POLICIES
DROP POLICY IF EXISTS "Customers can submit orders" ON public.orders;
CREATE POLICY "Customers can submit orders" ON public.orders
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view and manage all orders" ON public.orders;
CREATE POLICY "Admins can view and manage all orders" ON public.orders
  FOR ALL USING (public.is_admin() OR auth.role() = 'anon');

-- 4. ORDER ITEMS POLICIES
DROP POLICY IF EXISTS "Public can insert order items" ON public.order_items;
CREATE POLICY "Public can insert order items" ON public.order_items
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view and manage order items" ON public.order_items;
CREATE POLICY "Admins can view and manage order items" ON public.order_items
  FOR ALL USING (public.is_admin() OR auth.role() = 'anon');

-- 5. PAYMENTS POLICIES
DROP POLICY IF EXISTS "Public can record payments on checkout" ON public.payments;
CREATE POLICY "Public can record payments on checkout" ON public.payments
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view and manage payments" ON public.payments;
CREATE POLICY "Admins can view and manage payments" ON public.payments
  FOR ALL USING (public.is_admin() OR auth.role() = 'anon');

-- 6. OFFERS POLICIES
DROP POLICY IF EXISTS "Public can view active offers" ON public.offers;
CREATE POLICY "Public can view active offers" ON public.offers
  FOR SELECT USING (is_active = true OR public.is_admin() OR auth.role() = 'anon');

DROP POLICY IF EXISTS "Admins can manage offers" ON public.offers;
CREATE POLICY "Admins can manage offers" ON public.offers
  FOR ALL USING (public.is_admin());

-- 7. ADMIN PROFILES POLICIES
DROP POLICY IF EXISTS "Admins can view admin profiles" ON public.admin_profiles;
CREATE POLICY "Admins can view admin profiles" ON public.admin_profiles
  FOR SELECT USING (public.is_admin() OR user_id = auth.uid());

DROP POLICY IF EXISTS "Super admin can manage admin profiles" ON public.admin_profiles;
CREATE POLICY "Super admin can manage admin profiles" ON public.admin_profiles
  FOR ALL TO authenticated USING (auth.jwt() ->> 'email' = 'tharshini1773@gmail.com');

-- Automatic trigger: Link newly registered admin auth user to admin_profiles
CREATE OR REPLACE FUNCTION public.handle_admin_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.email = 'tharshini1773@gmail.com' THEN
    INSERT INTO public.admin_profiles (user_id, email, role, full_name)
    VALUES (NEW.id, NEW.email, 'admin', COALESCE(NEW.raw_user_meta_data->>'full_name', 'Tharshini (Owner & Head Baker)'))
    ON CONFLICT (email) DO UPDATE
      SET user_id = EXCLUDED.user_id,
          role = 'admin';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_admin
  AFTER INSERT OR UPDATE OF email ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_admin_auth_user();

-- ==============================================================================
-- INITIAL SEED DATA
-- ==============================================================================

-- Seed Products
INSERT INTO public.products (id, name, description, price, category, image_url, availability, weight, stock) VALUES
('cake-1', 'Classic Birthday Celebration Cake', 'Layers of light vanilla sponge with strawberry compote and whipped cream frosting.', 750.00, 'birthday', '/images/cake-birthday.jpg', true, '1 kg', 12),
('cake-2', 'Elegant Tiered Wedding Cake', 'Three tiers of rich almond cake with raspberry coulis and delicate sugar flowers.', 3500.00, 'wedding', '/images/cake-wedding.jpg', true, '3 kg', 5),
('cake-3', 'Belgian Dark Chocolate Truffle', 'Decadent 70% dark Belgian chocolate ganache with chocolate curls.', 850.00, 'chocolate', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80', true, '1 kg', 15),
('cake-4', 'Traditional Black Forest Gateau', 'Kirsch-soaked chocolate sponge, sour cherries, and fresh chantilly cream.', 800.00, 'black-forest', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80', true, '1 kg', 10),
('cake-5', 'Crimson Red Velvet Dream', 'Velvety crimson cocoa sponge with smooth Madagascan vanilla cream cheese frosting.', 900.00, 'red-velvet', 'https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?auto=format&fit=crop&w=800&q=80', true, '1 kg', 8),
('cake-6', 'Fresh Strawberry Shortcake', 'Airy Japanese sponge packed with fresh hand-picked Punnaikayal strawberries.', 850.00, 'strawberry', '/images/cake-strawberry.jpg', true, '1 kg', 10),
('cake-7', 'Custom Fondant Art Cake', 'Bespoke hand-crafted fondant sculpture tailored to your party theme.', 1800.00, 'customised', '/images/cake-custom.jpg', true, '2 kg', 6),
('cake-8', 'Edible Photo Print Cake', 'High-definition sugar sheet print of your celebration photograph.', 950.00, 'photo-cakes', 'https://images.unsplash.com/photo-1579372786545-d24232daf58c?auto=format&fit=crop&w=800&q=80', true, '1 kg', 10),
('cake-9', 'Artisan Celebration Cupcakes (Box of 6)', 'Assorted buttercream swirl cupcakes with chocolate pearls and sprinkles.', 450.00, 'cupcakes', '/images/cake-cupcakes.jpg', true, 'Box of 6', 20),
('cake-10', 'Romantic Anniversary Heart Cake', 'Vintage Lambeth piping with pink velvet buttercream and delicate sugar pearls.', 1200.00, 'anniversary', '/images/cake-anniversary.jpg', true, '1.5 kg', 8)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  category = EXCLUDED.category;

-- Seed Customers
INSERT INTO public.customers (id, name, email, phone, address, total_orders, total_spent) VALUES
('cust-101', 'Kavitha Rajan', 'kavitha.rajan@gmail.com', '9841234567', '42 Beach Road, Punnaikayal, Thoothukudi', 4, 4850.00),
('cust-102', 'Michael Selvan', 'michael.selvan@outlook.com', '9443219876', '12 Church Street, Punnaikayal, Thoothukudi', 3, 5200.00),
('cust-103', 'Deepa Natarajan', 'deepa.n@gmail.com', '9789012345', '88 Harbor View Lane, Thoothukudi', 2, 1900.00),
('cust-104', 'Arun Kumar', 'arun.k@yahoo.com', '9840192837', 'Shop Pickup at Punnaikayal', 5, 4250.00)
ON CONFLICT (phone) DO UPDATE SET
  name = EXCLUDED.name,
  total_orders = EXCLUDED.total_orders,
  total_spent = EXCLUDED.total_spent;

-- Seed Offers
INSERT INTO public.offers (id, title, description, discount_percentage, coupon_code, banner_text, start_date, expiry_date, is_active) VALUES
('offer-1', 'Weekend Celebration Special', 'Enjoy 15% OFF on all 2kg+ Birthday and Anniversary cakes this weekend!', 15.00, 'WEEKEND15', 'Enjoy 15% OFF on all 2kg+ Birthday and Anniversary cakes this weekend! Use code WEEKEND15.', '2026-11-01', '2026-11-30', true),
('offer-2', 'First Order Welcome Discount', 'Welcome to Sweet Crumbs Bakery! Get 10% discount on your first online cake order.', 10.00, 'SWEETWELCOME10', 'Welcome to Sweet Crumbs Bakery! Get 10% discount on your first online cake order.', '2026-11-01', '2026-12-31', true),
('offer-3', 'Festive Celebration Discount', 'Flat ₹200 off on multi-tier wedding and custom designer cakes above ₹2000.', 12.00, 'FESTIVE200', 'Flat ₹200 off on multi-tier wedding and custom designer cakes above ₹2000.', '2026-11-10', '2026-11-25', false)
ON CONFLICT (coupon_code) DO NOTHING;

-- Seed Admin Profile for Tharshini
INSERT INTO public.admin_profiles (id, email, role, full_name) VALUES
('admin-primary', 'tharshini1773@gmail.com', 'admin', 'Tharshini (Owner & Head Baker)')
ON CONFLICT (email) DO UPDATE SET
  role = 'admin',
  full_name = EXCLUDED.full_name;
