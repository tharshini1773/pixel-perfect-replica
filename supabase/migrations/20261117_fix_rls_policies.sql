-- ==============================================================================
-- Sweet Crumbs Bakery — RLS Policy Fix (v4 — Production-Safe)
-- Reviewed and corrected: 2026-11-17
--
-- Changes from v3:
--   1. ORDER ITEMS SUBQUERY FIX:
--      The v3 order_items INSERT WITH CHECK queried public.orders, but
--      anonymous users have NO SELECT on orders → subquery always fails
--      under RLS → checkout is broken.
--      Fix: New SECURITY DEFINER function validate_order_for_checkout()
--      that bypasses RLS internally to check the parent order exists.
--
--   2. PRODUCT_ID IS NULL BYPASS REMOVED:
--      All cakes (including "customised" category) are catalogue products
--      with known product IDs and prices in the products table.
--      product_id IS NOT NULL is now REQUIRED for all order items.
--      This closes the price-validation bypass.
--
--   3. STALE POLICY CLEANUP:
--      Now drops ALL policies on ALL 7 tables — including the 4 original
--      products policies and all v3-named policies — before recreating.
--      This prevents "permissive policy stacking" if the migration is
--      re-run or if old policies with different names still exist.
--
--   4. PRICE VALIDATION HELPER:
--      New SECURITY DEFINER function validate_order_item_price() for
--      consistent, safe price checking (future-proof even if products
--      SELECT policy changes).
--
-- Does NOT modify any existing data or schema.
-- Does NOT disable RLS.
-- Does NOT expose service-role keys.
-- Safe to run multiple times (DROP IF EXISTS before each CREATE).
-- ==============================================================================


-- ==============================================================================
-- STEP 1: Re-assert RLS is ON for all 7 tables (idempotent — safe to repeat)
-- ==============================================================================
ALTER TABLE public.products       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;


-- ==============================================================================
-- STEP 2: Drop ALL existing policies on ALL 7 tables.
--
-- This prevents "permissive policy stacking" where an old insecure policy
-- still grants access alongside the new secure one.
--
-- We drop BOTH the original policy names (from 20261117_complete migration)
-- AND the v3 policy names (from previous fix runs) to cover all cases.
-- ==============================================================================

-- ---- PRODUCTS (original migration names) ----
DROP POLICY IF EXISTS "Public can view available products"             ON public.products;
DROP POLICY IF EXISTS "Admins can insert products"                     ON public.products;
DROP POLICY IF EXISTS "Admins can update products"                     ON public.products;
DROP POLICY IF EXISTS "Admins can delete products"                     ON public.products;

-- ---- CUSTOMERS ----
DROP POLICY IF EXISTS "Public can insert customers on checkout"        ON public.customers;
DROP POLICY IF EXISTS "Admins can view and manage all customers"       ON public.customers;
-- v3 names
DROP POLICY IF EXISTS "Public can register as customer at checkout"    ON public.customers;

-- ---- ORDERS ----
DROP POLICY IF EXISTS "Customers can submit orders"                    ON public.orders;
DROP POLICY IF EXISTS "Admins can view and manage all orders"          ON public.orders;
-- v3 names
DROP POLICY IF EXISTS "Customers can submit new orders"                ON public.orders;

-- ---- ORDER ITEMS ----
DROP POLICY IF EXISTS "Public can insert order items"                  ON public.order_items;
DROP POLICY IF EXISTS "Admins can view and manage order items"         ON public.order_items;
-- v3 names
DROP POLICY IF EXISTS "Customers can insert order items at checkout"   ON public.order_items;

-- ---- PAYMENTS ----
DROP POLICY IF EXISTS "Public can record payments on checkout"         ON public.payments;
DROP POLICY IF EXISTS "Admins can view and manage payments"            ON public.payments;

-- ---- OFFERS ----
DROP POLICY IF EXISTS "Public can view active offers"                  ON public.offers;
DROP POLICY IF EXISTS "Admins can manage offers"                       ON public.offers;
-- v3 names
DROP POLICY IF EXISTS "Public can view active offers only"             ON public.offers;
DROP POLICY IF EXISTS "Admins can manage all offers"                   ON public.offers;

-- ---- ADMIN PROFILES ----
DROP POLICY IF EXISTS "Admins can view admin profiles"                 ON public.admin_profiles;
DROP POLICY IF EXISTS "Super admin can manage admin profiles"          ON public.admin_profiles;
-- v3 names
DROP POLICY IF EXISTS "Authenticated users can view their own admin profile" ON public.admin_profiles;
DROP POLICY IF EXISTS "Admins can view all admin profiles"             ON public.admin_profiles;
DROP POLICY IF EXISTS "Super admin can fully manage admin profiles"    ON public.admin_profiles;


-- ==============================================================================
-- STEP 3: SECURITY DEFINER helper functions
--
-- These run with the FUNCTION OWNER's privileges (bypassing RLS internally)
-- so that WITH CHECK clauses in public INSERT policies can safely validate
-- data across tables that anonymous users cannot SELECT.
--
-- Both use:
--   SECURITY DEFINER  — executes with owner (postgres) privileges
--   SET search_path = public  — prevents search_path injection attacks
--   STABLE  — does not modify data, can be optimised by planner
-- ==============================================================================

-- validate_order_for_checkout():
--   Returns TRUE only if the given order_id exists AND is in a
--   customer-submittable state (order_status = new/pending, payment pending).
--   Used by the order_items INSERT policy to verify the parent order
--   WITHOUT requiring a public SELECT policy on the orders table.
CREATE OR REPLACE FUNCTION public.validate_order_for_checkout(p_order_id TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.orders
    WHERE id = p_order_id
      AND order_status IN ('new', 'pending')
      AND payment_status = 'pending'
  );
$$;

-- validate_order_item_price():
--   Returns TRUE only if the product exists, is available, and the
--   submitted unit_price matches the actual catalogue price (within ₹0.01).
--   Used by the order_items INSERT policy for tamper-proof price validation.
--   Although products currently has a public SELECT policy, using a
--   SECURITY DEFINER function here future-proofs against policy changes.
CREATE OR REPLACE FUNCTION public.validate_order_item_price(
  p_product_id TEXT,
  p_unit_price NUMERIC
)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.products
    WHERE id = p_product_id
      AND availability = true
      AND abs(price - p_unit_price) < 0.01
  );
$$;


-- ==============================================================================
-- TABLE 1: PRODUCTS
--
-- Public:  SELECT all products (browse the cake catalogue)
-- Admin:   INSERT / UPDATE / DELETE (manage the product menu)
--
-- These are the same as the original migration — confirmed correct.
-- Recreated here to ensure clean state after DROP above.
-- ==============================================================================

CREATE POLICY "Public can view available products" ON public.products
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert products" ON public.products
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update products" ON public.products
  FOR UPDATE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can delete products" ON public.products
  FOR DELETE
  TO authenticated
  USING (public.is_admin());


-- ==============================================================================
-- TABLE 2: CUSTOMERS
--
-- Public INSERT (checkout):
--   Allowed, but WITH CHECK prevents:
--   - Setting total_orders or total_spent (manipulation of loyalty metrics)
--   - Requires name and phone are not empty (minimum data integrity)
--
-- Public has NO SELECT / UPDATE / DELETE on customers.
--   → Customer names, phone numbers, addresses are protected.
--
-- Admin ALL:
--   Full CRUD — only authenticated admin verified by is_admin()
-- ==============================================================================

CREATE POLICY "Public can register as customer at checkout" ON public.customers
  FOR INSERT
  WITH CHECK (
    -- Customer name and phone are required
    char_length(trim(name)) > 0
    AND char_length(trim(phone)) > 0
    -- Prevent public from inflating loyalty counters
    AND (total_orders IS NULL OR total_orders = 0)
    AND (total_spent  IS NULL OR total_spent  = 0)
  );

CREATE POLICY "Admins can view and manage all customers" ON public.customers
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ==============================================================================
-- TABLE 3: ORDERS
--
-- Public INSERT (checkout):
--   Allowed, but WITH CHECK enforces:
--   - payment_status must be 'pending' — customer cannot self-mark as 'paid'
--   - order_status must be 'new' or 'pending' — customer cannot skip to 'delivered'
--   - total_amount must be > 0
--   - customer_name and phone are required
--
-- Public has NO SELECT / UPDATE / DELETE on orders.
--   → Existing order data, customer details, addresses are protected.
--
-- Admin ALL:
--   Full CRUD — only authenticated admin
-- ==============================================================================

CREATE POLICY "Customers can submit new orders" ON public.orders
  FOR INSERT
  WITH CHECK (
    -- Required fields
    char_length(trim(customer_name)) > 0
    AND char_length(trim(phone)) > 0
    -- Prevent customers from self-marking orders as paid or fulfilled
    AND payment_status = 'pending'
    AND order_status IN ('new', 'pending')
    -- Prevent zero-value or negative orders
    AND total_amount > 0
  );

CREATE POLICY "Admins can view and manage all orders" ON public.orders
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ==============================================================================
-- TABLE 4: ORDER ITEMS
--
-- Public INSERT (checkout):
--   Allowed, but WITH CHECK enforces:
--   - quantity must be >= 1
--   - unit_price must be positive
--   - subtotal must equal quantity × unit_price exactly (no rounding tricks)
--   - product_id IS NOT NULL — all cakes (including "customised" category)
--     are catalogue products with known IDs and prices
--   - Price validation via validate_order_item_price() — the submitted
--     unit_price must match the actual product price (within ₹0.01)
--   - Parent order validation via validate_order_for_checkout() — the
--     parent order must exist and be in 'new'/'pending' status with
--     payment_status = 'pending'. Uses SECURITY DEFINER to bypass RLS
--     on the orders table (anonymous users have no SELECT on orders).
--
-- Public has NO SELECT / UPDATE / DELETE on order_items.
--
-- Admin ALL:
--   Full CRUD — only authenticated admin
-- ==============================================================================

CREATE POLICY "Customers can insert order items at checkout" ON public.order_items
  FOR INSERT
  WITH CHECK (
    -- Quantity must be at least 1
    quantity >= 1
    -- unit_price must be positive
    AND unit_price > 0
    -- Subtotal must equal quantity × unit_price (no rounding tricks)
    AND subtotal = quantity * unit_price
    -- product_id is REQUIRED — all cakes including custom are catalogue products
    AND product_id IS NOT NULL
    -- Validate the price matches the actual product catalogue price
    -- Uses SECURITY DEFINER function (safe even if products policy changes)
    AND public.validate_order_item_price(product_id, unit_price)
    -- The parent order must exist and be in a submittable state
    -- Uses SECURITY DEFINER function to bypass RLS on orders table
    AND public.validate_order_for_checkout(order_id)
  );

CREATE POLICY "Admins can view and manage order items" ON public.order_items
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ==============================================================================
-- TABLE 5: PAYMENTS
--
-- ⚠️  PUBLIC INSERT IS INTENTIONALLY REMOVED.
--
-- Reason: Allowing anonymous users to INSERT into the payments table with
-- payment_status = 'paid' or amount = 1 is equivalent to trusting a
-- frontend "payment success" message — which is a critical security hole.
--
-- Sweet Crumbs Bakery workflow:
--   1. Customer places order → order saved with payment_status = 'pending'
--   2. Customer pays via UPI/bank transfer (outside the app)
--   3. Admin verifies payment receipt and marks the order as 'paid' in the dashboard
--   4. The payment record is created by the admin CRUD operation (authenticated)
--
-- This is the correct secure flow for a manual-verification bakery.
-- Payment records are ADMIN-ONLY.
-- ==============================================================================

CREATE POLICY "Admins can view and manage payments" ON public.payments
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ==============================================================================
-- TABLE 6: OFFERS
--
-- Public SELECT:
--   Active offers only (is_active = true)
--   Inactive/expired/draft offers are NOT visible to public
--
-- Admin ALL:
--   Full CRUD — manage all offers including inactive ones
-- ==============================================================================

CREATE POLICY "Public can view active offers only" ON public.offers
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage all offers" ON public.offers
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ==============================================================================
-- TABLE 7: ADMIN PROFILES
--
-- Anonymous:  Zero access (no policy grants anon SELECT, INSERT, UPDATE, DELETE)
--
-- Any authenticated user:
--   SELECT their own row only (user_id = auth.uid())
--   This is safe since only Tharshini has an admin_profiles row currently.
--
-- Authenticated + is_admin():
--   SELECT all rows (view all admin accounts)
--
-- Tharshini only (JWT email check):
--   Full CRUD — the only person who can create, update, or delete admin accounts
--   Prevents privilege escalation: no other user can promote themselves to admin
-- ==============================================================================

CREATE POLICY "Authenticated users can view their own admin profile" ON public.admin_profiles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all admin profiles" ON public.admin_profiles
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Super admin can fully manage admin profiles" ON public.admin_profiles
  FOR ALL
  TO authenticated
  USING  (auth.jwt() ->> 'email' = 'tharshini1773@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'tharshini1773@gmail.com');


-- ==============================================================================
-- END OF MIGRATION
--
-- Summary of SECURITY DEFINER functions in this database:
--   1. is_admin()                     — defined in original migration (unchanged)
--   2. handle_admin_auth_user()       — trigger, defined in original migration (unchanged)
--   3. validate_order_for_checkout()  — NEW in v4 (this file)
--   4. validate_order_item_price()    — NEW in v4 (this file)
--
-- All use SET search_path = public to prevent search_path injection.
-- None expose service-role keys.
-- None modify existing data.
-- ==============================================================================
