-- ==============================================================================
-- Sweet Crumbs Bakery — Complete Production Database Schema & Security
-- ==============================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. ENUMS & DOMAINS
do $$ begin
  create type order_status as enum ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type user_role_type as enum ('admin', 'staff', 'customer');
exception
  when duplicate_object then null;
end $$;

-- 3. PROFILES TABLE (Linked with Supabase Auth users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 4. USER ROLES TABLE (Secure role-based access control)
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role user_role_type not null default 'customer',
  created_at timestamptz default now() not null,
  unique (user_id, role)
);

-- 5. CATEGORIES TABLE
create table if not exists public.categories (
  id text primary key,
  name text not null,
  blurb text,
  image text not null,
  sort_order int default 0 not null,
  created_at timestamptz default now() not null
);

-- 6. PRODUCTS TABLE
create table if not exists public.products (
  id text primary key,
  name text not null,
  category_id text references public.categories(id) on delete set null,
  description text,
  price numeric(10, 2) not null check (price >= 0),
  discount_price numeric(10, 2) check (discount_price >= 0),
  weight text default '1 kg' not null,
  image text not null,
  is_available boolean default true not null,
  stock_quantity int default 10 not null check (stock_quantity >= 0),
  tag text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 7. CUSTOMERS TABLE
create table if not exists public.customers (
  id text primary key,
  name text not null,
  email text,
  phone text not null,
  total_orders int default 1 not null,
  total_spent numeric(12, 2) default 0 not null,
  last_order_at timestamptz default now() not null,
  created_at timestamptz default now() not null
);

-- 8. ORDERS TABLE
create table if not exists public.orders (
  id text primary key,
  customer_name text not null,
  customer_email text,
  customer_phone text not null,
  delivery_date text,
  cake_message text,
  notes text,
  total_amount numeric(10, 2) not null check (total_amount >= 0),
  status order_status default 'pending' not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 9. ORDER ITEMS TABLE
create table if not exists public.order_items (
  id text primary key,
  order_id text references public.orders(id) on delete cascade not null,
  product_id text references public.products(id) on delete set null,
  product_name text not null,
  price numeric(10, 2) not null check (price >= 0),
  quantity int default 1 not null check (quantity > 0),
  total numeric(10, 2) not null check (total >= 0)
);

-- 10. OFFERS & PROMOTIONAL BANNERS
create table if not exists public.offers (
  id text primary key,
  title text not null,
  code text,
  discount_percentage numeric(5, 2) not null check (discount_percentage >= 0 and discount_percentage <= 100),
  banner_text text not null,
  start_date text,
  end_date text,
  is_active boolean default true not null,
  created_at timestamptz default now() not null
);

-- 11. SHOP SETTINGS
create table if not exists public.shop_settings (
  id text primary key default 'default',
  shop_name text not null default 'Sweet Crumbs Bakery',
  logo_url text default '/logo.svg',
  phone text not null default '7550362608',
  email text not null default 'tharshini1773@gmail.com',
  address text not null default '1/589F, 100 House, Punnaikayal, Thoothukudi, Tamil Nadu, India',
  opening_hours text not null default 'Mon - Sun: 9:00 AM - 9:00 PM',
  updated_at timestamptz default now() not null
);

-- 12. ROW LEVEL SECURITY (RLS) HELPER FUNCTIONS
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = auth.uid()
      and role = 'admin'
  );
$$;

-- 13. ENABLE RLS
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.offers enable row level security;
alter table public.shop_settings enable row level security;

-- 14. POLICIES

-- Profiles
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id or public.is_admin());
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id or public.is_admin());

-- User Roles
create policy "Admins can manage user roles" on public.user_roles
  for all using (public.is_admin());
create policy "Users can view own roles" on public.user_roles
  for select using (auth.uid() = user_id);

-- Categories
create policy "Public can view categories" on public.categories
  for select using (true);
create policy "Admins can insert categories" on public.categories
  for insert with check (public.is_admin());
create policy "Admins can update categories" on public.categories
  for update using (public.is_admin());
create policy "Admins can delete categories" on public.categories
  for delete using (public.is_admin());

-- Products
create policy "Public can view products" on public.products
  for select using (true);
create policy "Admins can insert products" on public.products
  for insert with check (public.is_admin());
create policy "Admins can update products" on public.products
  for update using (public.is_admin());
create policy "Admins can delete products" on public.products
  for delete using (public.is_admin());

-- Orders
create policy "Public can create orders" on public.orders
  for insert with check (true);
create policy "Admins can view orders" on public.orders
  for select using (public.is_admin());
create policy "Admins can update orders" on public.orders
  for update using (public.is_admin());
create policy "Admins can delete orders" on public.orders
  for delete using (public.is_admin());

-- Order Items
create policy "Public can insert order items" on public.order_items
  for insert with check (true);
create policy "Admins can view order items" on public.order_items
  for select using (public.is_admin());
create policy "Admins can update order items" on public.order_items
  for update using (public.is_admin());
create policy "Admins can delete order items" on public.order_items
  for delete using (public.is_admin());

-- Customers
create policy "Public can insert/upsert customers on order" on public.customers
  for insert with check (true);
create policy "Admins can view and manage customers" on public.customers
  for all using (public.is_admin());

-- Offers
create policy "Public can view active offers" on public.offers
  for select using (is_active = true or public.is_admin());
create policy "Admins can manage offers" on public.offers
  for all using (public.is_admin());

-- Shop Settings
create policy "Public can view shop settings" on public.shop_settings
  for select using (true);
create policy "Admins can update shop settings" on public.shop_settings
  for update using (public.is_admin());

-- 15. SEED INITIAL DATA
insert into public.shop_settings (id, shop_name, logo_url, phone, email, address, opening_hours)
values (
  'default',
  'Sweet Crumbs Bakery',
  '/logo.svg',
  '7550362608',
  'tharshini1773@gmail.com',
  '1/589F, 100 House, Punnaikayal, Thoothukudi, Tamil Nadu, India',
  'Mon - Sun: 9:00 AM - 9:00 PM'
) on conflict (id) do nothing;

insert into public.categories (id, name, blurb, image, sort_order) values
('birthday', 'Birthday Cakes', 'Bright, joyful celebrations with candles & sprinkles', 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=800&q=80', 1),
('wedding', 'Wedding Cakes', 'Grand multi-tier masterpieces for your special day', 'https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=800&q=80', 2),
('chocolate', 'Chocolate Cakes', 'Rich Belgian ganache, fudge layers & silky glaze', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80', 3),
('black-forest', 'Black Forest Cakes', 'Authentic dark cherries, kirsch cream & chocolate curls', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80', 4),
('red-velvet', 'Red Velvet Cakes', 'Crimson cocoa sponge with velvety cream cheese frosting', 'https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?auto=format&fit=crop&w=800&q=80', 5),
('strawberry', 'Strawberry Cakes', 'Fresh garden strawberries, light sponge & berry cream', 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80', 6),
('customised', 'Customised Cakes', 'Themed designs, bespoke fondant art & sculpted tiers', 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=800&q=80', 7),
('photo-cakes', 'Photo Cakes', 'High-definition edible sugar sheet prints with rose piping', 'https://images.unsplash.com/photo-1579372786545-d24232daf58c?auto=format&fit=crop&w=800&q=80', 8),
('cupcakes', 'Cupcakes', 'Artisan piped frosting, sprinkles, chocolates & fruit', 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&w=800&q=80', 9),
('anniversary', 'Anniversary Cakes', 'Heart shapes, vintage Lambeth piping & romantic florals', 'https://images.unsplash.com/photo-1518047601542-4505c4434222?auto=format&fit=crop&w=800&q=80', 10)
on conflict (id) do nothing;

insert into public.offers (id, title, code, discount_percentage, banner_text, start_date, end_date, is_active) values
('welcome15', 'Welcome Festive Offer', 'SWEET15', 15.00, '🎉 Special Celebration Offer: Get 15% OFF on all handcrafted custom & wedding cakes this week! Use code SWEET15', '2026-11-01', '2026-12-31', true)
on conflict (id) do nothing;

