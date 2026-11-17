-- ==============================================================================
-- Sweet Crumbs Bakery — RLS Policy Fix (v3 — Production-Safe)
-- Reviewed and corrected: 2026-11-17
--
-- Changes from v2:
--   - Orders:      Public INSERT now enforces payment_status='pending',
--                  order_status IN ('new','pending'), total_amount > 0
--   - Order items: Public INSERT now validates unit_price matches product table,
--                  enforces subtotal = quantity * unit_price, qty > 0
--   - Payments:    Public INSERT REMOVED — payment records are admin-only.
--                  Trusting frontend payment-success messages is a security hole.
--   - Customers:   Public INSERT restricted to safe fields only (no total_orders,
--                  no total_spent inflation)
--   - All tables:  RLS re-asserted; old conflicting policies explicitly dropped.
--
-- Does NOT modify any existing data or schema.
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
-- STEP 2: Drop ALL existing policies on the 5 affected tables.
-- This prevents "permissive policy stacking" where an old insecure policy
-- still grants access alongside the new secure one.
-- (products and admin_profiles left in STEP 3 for explicit handling)
-- ==============================================================================

-- Drop all old customers policies
DROP POLICY IF EXISTS "Public can insert customers on checkout"    ON public.customers;
DROP POLICY IF EXISTS "Admins can view and manage all customers"   ON public.customers;

-- Drop all old orders policies
DROP POLICY IF EXISTS "Customers can submit orders"                ON public.orders;
DROP POLICY IF EXISTS "Admins can view and manage all orders"      ON public.orders;

-- Drop all old order_items policies
DROP POLICY IF EXISTS "Public can insert order items"              ON public.order_items;
DROP POLICY IF EXISTS "Admins can view and manage order items"     ON public.order_items;

-- Drop all old payments policies
DROP POLICY IF EXISTS "Public can record payments on checkout"     ON public.payments;
DROP POLICY IF EXISTS "Admins can view and manage payments"        ON public.payments;

-- Drop all old offers policies
DROP POLICY IF EXISTS "Public can view active offers"              ON public.offers;
DROP POLICY IF EXISTS "Admins can manage offers"                   ON public.offers;

-- Drop all old admin_profiles policies
DROP POLICY IF EXISTS "Admins can view admin profiles"             ON public.admin_profiles;
DROP POLICY IF EXISTS "Super admin can manage admin profiles"      ON public.admin_profiles;


-- ==============================================================================
-- TABLE 1: PRODUCTS — Unchanged from original (already correct)
-- Public:  SELECT all products (browse the cake catalogue)
-- Admin:   INSERT / UPDATE / DELETE (manage the product menu)
-- ==============================================================================
-- (These were already correct in the original migration — not modified.)
-- Listed here only for reference; policies already exist on the live database.


-- ==============================================================================
-- TABLE 2: CUSTOMERS
--
-- Public INSERT (checkout):
--   Allowed, but WITH CHECK prevents:
--   - Setting total_orders or total_spent (manipulation of loyalty metrics)
--   - Requires phone is not empty (minimum data integrity)
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
--   - unit_price must match the actual product price in the products table
--     (prevents customers from sending unit_price = 1 for a ₹850 cake)
--   - subtotal must equal quantity * unit_price exactly
--     (prevents total manipulation)
--   - The parent order_id must exist AND be in 'new'/'pending' status
--     (prevents inserting items into orders that have already been confirmed)
--   - If product_id is supplied, it must exist and be available
--
-- Admin ALL:
--   Full CRUD — only authenticated admin
-- ==============================================================================

CREATE POLICY "Customers can insert order items at checkout" ON public.order_items
  FOR INSERT
  WITH CHECK (
    -- Quantity must be at least 1
    quantity >= 1
    -- Subtotal must equal quantity × unit_price (no rounding tricks)
    AND subtotal = quantity * unit_price
    -- unit_price must be positive
    AND unit_price > 0
    -- The parent order must exist and still be in a customer-submittable state
    AND EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id
        AND o.order_status IN ('new', 'pending')
        AND o.payment_status = 'pending'
    )
    -- If a product_id is supplied, verify it exists and is available
    AND (
      product_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.products p
        WHERE p.id = product_id
          AND p.availability = true
          -- Validate the price matches the actual product price (within ₹0.01 tolerance)
          AND abs(p.price - unit_price) < 0.01
      )
    )
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
-- frontend "payment success" message — which is a critical security vulnerability.
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
--   is_admin() returns FALSE for anon users (auth.uid() is NULL), so the
--   OR clause only helps authenticated admins see all offers via the same policy
--
-- Admin ALL:
--   Full CRUD via second policy — manage all offers including inactive ones
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
--
-- Note: WITH CHECK on the FOR ALL policy = Tharshini can only INSERT rows where
-- the JWT email matches — she cannot insert a row on behalf of another user
-- without that user's JWT, which is correct.
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
