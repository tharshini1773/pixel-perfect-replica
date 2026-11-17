-- ==============================================================================
-- Sweet Crumbs Bakery — RLS Policy Fix
-- Removes the insecure "auth.role() = 'anon'" bypass that allowed anonymous
-- users to read orders, customers, payments, order_items, and admin_profiles.
-- ==============================================================================

-- ============================================================
-- 2. CUSTOMERS — Admins only for SELECT; anon can INSERT
-- ============================================================
DROP POLICY IF EXISTS "Admins can view and manage all customers" ON public.customers;
CREATE POLICY "Admins can view and manage all customers" ON public.customers
  FOR ALL TO authenticated USING (public.is_admin());

-- Allow anon to insert their own customer record at checkout (keep this)
DROP POLICY IF EXISTS "Public can insert customers on checkout" ON public.customers;
CREATE POLICY "Public can insert customers on checkout" ON public.customers
  FOR INSERT WITH CHECK (true);

-- ============================================================
-- 3. ORDERS — Admins only for SELECT/UPDATE/DELETE; anon can INSERT
-- ============================================================
DROP POLICY IF EXISTS "Admins can view and manage all orders" ON public.orders;
CREATE POLICY "Admins can view and manage all orders" ON public.orders
  FOR ALL TO authenticated USING (public.is_admin());

-- Public customers can still submit orders (INSERT only)
DROP POLICY IF EXISTS "Customers can submit orders" ON public.orders;
CREATE POLICY "Customers can submit orders" ON public.orders
  FOR INSERT WITH CHECK (true);

-- ============================================================
-- 4. ORDER ITEMS — Admins only for SELECT; anon can INSERT
-- ============================================================
DROP POLICY IF EXISTS "Admins can view and manage order items" ON public.order_items;
CREATE POLICY "Admins can view and manage order items" ON public.order_items
  FOR ALL TO authenticated USING (public.is_admin());

-- Public can insert order items as part of checkout
DROP POLICY IF EXISTS "Public can insert order items" ON public.order_items;
CREATE POLICY "Public can insert order items" ON public.order_items
  FOR INSERT WITH CHECK (true);

-- ============================================================
-- 5. PAYMENTS — Admins only for SELECT; anon can INSERT payment record
-- ============================================================
DROP POLICY IF EXISTS "Admins can view and manage payments" ON public.payments;
CREATE POLICY "Admins can view and manage payments" ON public.payments
  FOR ALL TO authenticated USING (public.is_admin());

-- Public can record their payment at checkout
DROP POLICY IF EXISTS "Public can record payments on checkout" ON public.payments;
CREATE POLICY "Public can record payments on checkout" ON public.payments
  FOR INSERT WITH CHECK (true);

-- ============================================================
-- 7. ADMIN PROFILES — Strictly admin-only; no anon access
-- ============================================================
DROP POLICY IF EXISTS "Admins can view admin profiles" ON public.admin_profiles;
CREATE POLICY "Admins can view admin profiles" ON public.admin_profiles
  FOR SELECT TO authenticated USING (public.is_admin() OR user_id = auth.uid());

DROP POLICY IF EXISTS "Super admin can manage admin profiles" ON public.admin_profiles;
CREATE POLICY "Super admin can manage admin profiles" ON public.admin_profiles
  FOR ALL TO authenticated USING (auth.jwt() ->> 'email' = 'tharshini1773@gmail.com');
