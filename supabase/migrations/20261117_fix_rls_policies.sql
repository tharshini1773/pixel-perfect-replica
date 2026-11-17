-- ==============================================================================
-- Sweet Crumbs Bakery — RLS Policy Fix (v2)
-- Removes ALL insecure "auth.role() = 'anon'" bypasses.
-- Covers: customers, orders, order_items, payments, admin_profiles, AND offers.
-- Does NOT touch: products (already correct), data, or schema.
-- Safe to run multiple times (DROP IF EXISTS before each CREATE).
-- ==============================================================================

-- ============================================================
-- 2. CUSTOMERS
-- Public: INSERT only (checkout customer registration)
-- Admin:  Full CRUD (view, update, delete customer records)
-- ============================================================
DROP POLICY IF EXISTS "Admins can view and manage all customers" ON public.customers;
CREATE POLICY "Admins can view and manage all customers" ON public.customers
  FOR ALL TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Public can insert customers on checkout" ON public.customers;
CREATE POLICY "Public can insert customers on checkout" ON public.customers
  FOR INSERT WITH CHECK (true);

-- ============================================================
-- 3. ORDERS
-- Public: INSERT only (place a new order at checkout)
-- Admin:  Full CRUD (view, update status, delete orders)
-- ============================================================
DROP POLICY IF EXISTS "Admins can view and manage all orders" ON public.orders;
CREATE POLICY "Admins can view and manage all orders" ON public.orders
  FOR ALL TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Customers can submit orders" ON public.orders;
CREATE POLICY "Customers can submit orders" ON public.orders
  FOR INSERT WITH CHECK (true);

-- ============================================================
-- 4. ORDER ITEMS
-- Public: INSERT only (line items submitted as part of checkout)
-- Admin:  Full CRUD (view, manage order line items)
-- ============================================================
DROP POLICY IF EXISTS "Admins can view and manage order items" ON public.order_items;
CREATE POLICY "Admins can view and manage order items" ON public.order_items
  FOR ALL TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Public can insert order items" ON public.order_items;
CREATE POLICY "Public can insert order items" ON public.order_items
  FOR INSERT WITH CHECK (true);

-- ============================================================
-- 5. PAYMENTS
-- Public: INSERT only (payment record created at checkout)
-- Admin:  Full CRUD (view, update payment status, reconcile)
-- ============================================================
DROP POLICY IF EXISTS "Admins can view and manage payments" ON public.payments;
CREATE POLICY "Admins can view and manage payments" ON public.payments
  FOR ALL TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Public can record payments on checkout" ON public.payments;
CREATE POLICY "Public can record payments on checkout" ON public.payments
  FOR INSERT WITH CHECK (true);

-- ============================================================
-- 6. OFFERS  ← ALSO FIXED (was missing from original fix)
-- Public: SELECT active offers only (is_active = true)
--         Inactive/expired/draft offers must NOT be visible to public
-- Admin:  Full CRUD (create, toggle, delete offers)
-- ============================================================
DROP POLICY IF EXISTS "Public can view active offers" ON public.offers;
CREATE POLICY "Public can view active offers" ON public.offers
  FOR SELECT USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage offers" ON public.offers;
CREATE POLICY "Admins can manage offers" ON public.offers
  FOR ALL TO authenticated USING (public.is_admin());

-- ============================================================
-- 7. ADMIN PROFILES
-- Strictly authenticated-only. Anonymous users cannot access at all.
-- Admin:  SELECT own row or any row if is_admin()
-- Super admin (tharshini1773@gmail.com): Full CRUD via JWT email check
-- ============================================================
DROP POLICY IF EXISTS "Admins can view admin profiles" ON public.admin_profiles;
CREATE POLICY "Admins can view admin profiles" ON public.admin_profiles
  FOR SELECT TO authenticated USING (public.is_admin() OR user_id = auth.uid());

DROP POLICY IF EXISTS "Super admin can manage admin profiles" ON public.admin_profiles;
CREATE POLICY "Super admin can manage admin profiles" ON public.admin_profiles
  FOR ALL TO authenticated USING (auth.jwt() ->> 'email' = 'tharshini1773@gmail.com');
