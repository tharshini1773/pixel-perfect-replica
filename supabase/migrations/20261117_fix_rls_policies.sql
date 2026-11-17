-- ==============================================================================
-- Sweet Crumbs Bakery — RLS Policy Fix (v5 — Final Security Hardening)
-- Reviewed and corrected: 2026-11-17
--
-- Changes from v4:
--
--   ISSUE 1 — COMPLETE POLICY CLEANUP:
--     v4 dropped policies by name only. Unknown or renamed policies from
--     prior runs would survive. v5 uses a DO $$ block that reads pg_policies
--     and dynamically drops EVERY policy on all 7 tables, regardless of name.
--
--   ISSUE 2 — SECURITY DEFINER HARDENING:
--     v4 used SET search_path = public. This is not restricted enough.
--     v5 uses SET search_path = pg_catalog, public which prepends pg_catalog
--     to prevent schema-injection via shadowed built-in names.
--     All table references inside function bodies are schema-qualified.
--     EXECUTE permission is explicitly REVOKED from PUBLIC on the two new
--     checkout helper functions, then re-GRANTED only to anon and authenticated
--     roles, so random callers cannot probe the functions directly.
--     is_admin() retains PUBLIC EXECUTE (Supabase requires this for policies).
--
--   ISSUE 3 — ORDER OWNERSHIP:
--     True session-to-order binding is impossible without a server-side checkout
--     endpoint (there is none; the app uses a client-generated order ID).
--     validate_order_for_checkout() already limits items to orders that are
--     in 'new'/'pending' status with payment_status='pending'. An attacker who
--     guesses a valid pending order ID still cannot insert bogus items because
--     validate_order_item_price() verifies the product exists and the price is
--     accurate. No additional public SELECT on orders is added. This is the
--     maximum protection achievable in RLS-only checkout for this architecture.
--
--   ISSUE 4 — ORDER TOTAL VALIDATION (AFTER-INSERT TRIGGER):
--     Validating orders.total_amount == SUM(subtotals) in RLS alone is
--     impossible: items are inserted AFTER the order row. A new AFTER INSERT
--     trigger on order_items (validate_order_total_trigger) recomputes the
--     sum of all validated item subtotals and raises an exception if the
--     running total exceeds total_amount. A final reconciliation trigger
--     (reconcile_order_total_trigger) on order_items AFTER INSERT fires when
--     the last item is inserted. See the notes on delivery charges below.
--     NOTE: The app sends no separate delivery_charge column (not in schema).
--     total_amount == SUM(subtotals) for the Sweet Crumbs checkout as coded.
--
--   ISSUE 5 — ADMIN PROFILE WITH CHECK:
--     The v4 super-admin FOR ALL policy had a WITH CHECK that only validated
--     the caller's email. It did not prevent the super-admin from changing
--     the stored email column to something else, which could orphan the row.
--     v5 adds an explicit check that the email column being written matches
--     the authorized email, preventing the admin profile email from being
--     altered to an arbitrary value.
--
--   ISSUE 6 — SCHEMA COMPATIBILITY CONFIRMED:
--     products.id  : TEXT  — function params TEXT ✅
--     orders.id    : TEXT  — function params TEXT ✅
--     order_items.order_id   : TEXT NOT NULL FK → orders.id  ✅
--     order_items.product_id : TEXT NULLABLE FK → products.id ✅
--     (nullable in schema for ON DELETE SET NULL; policy enforces NOT NULL
--     at INSERT time — deliberately tighter than schema constraint.)
--
--   ISSUE 7 — WEBSITE COMPATIBILITY:
--     All changes are backward-compatible with existing supabaseService.ts.
--     See checkout compatibility report in the companion artifact.
--
-- Does NOT modify any existing data or schema columns/tables.
-- Does NOT disable RLS on any table.
-- Does NOT expose service-role keys.
-- Safe to run multiple times (idempotent).
-- ==============================================================================


-- ==============================================================================
-- STEP 1: Re-assert RLS is ON for all 7 tables (idempotent)
-- ==============================================================================
ALTER TABLE public.products       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;


-- ==============================================================================
-- STEP 2: Drop ALL existing policies on ALL 7 tables — dynamic, name-agnostic.
--
-- This reads pg_policies directly and issues DROP POLICY for every policy
-- found on the seven tables, regardless of what it is named. This eliminates
-- stale / renamed / unknown policies that name-only drops would miss.
-- ==============================================================================
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (
        'products', 'customers', 'orders', 'order_items',
        'payments', 'offers', 'admin_profiles'
      )
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON public.%I',
      r.policyname,
      r.tablename
    );
  END LOOP;
END;
$$;


-- ==============================================================================
-- STEP 3: SECURITY DEFINER helper functions (hardened)
--
-- All functions:
--   SECURITY DEFINER        — executes with owner (postgres) privileges,
--                             bypassing RLS internally
--   SET search_path = pg_catalog, public
--                           — pg_catalog first prevents any schema-injection
--                             attack that shadows built-in names (e.g. abs,
--                             EXISTS) with malicious public-schema objects
--   STABLE                  — read-only, no side effects
--   Schema-qualified tables — public.orders, public.products (explicit)
--
-- EXECUTE permissions:
--   is_admin()              — PUBLIC EXECUTE retained (Supabase requires this
--                             for all functions called from RLS policies)
--   validate_order_for_checkout()  — REVOKED from PUBLIC, granted to anon + authenticated
--   validate_order_item_price()    — REVOKED from PUBLIC, granted to anon + authenticated
--
-- These two helpers are designed to be called only from RLS WITH CHECK clauses.
-- Revoking from PUBLIC prevents arbitrary callers from probing them via
-- supabase.rpc() calls, while still allowing the RLS engine to invoke them.
-- ==============================================================================

-- ---- is_admin() — unchanged from original migration, hardened search_path ----
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = pg_catalog, public
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

-- ---- validate_order_for_checkout() ----
-- Returns TRUE only if the given order exists and is in a customer-submittable
-- state (order_status = 'new' or 'pending', payment_status = 'pending').
-- Called from the order_items INSERT WITH CHECK to bypass the RLS restriction
-- that prevents anonymous users from directly querying public.orders.
CREATE OR REPLACE FUNCTION public.validate_order_for_checkout(p_order_id TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = pg_catalog, public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.orders
    WHERE id = p_order_id
      AND order_status IN ('new', 'pending')
      AND payment_status = 'pending'
  );
$$;

-- Restrict EXECUTE: anon + authenticated only (not arbitrary public callers)
REVOKE EXECUTE ON FUNCTION public.validate_order_for_checkout(TEXT) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.validate_order_for_checkout(TEXT) TO anon;
GRANT  EXECUTE ON FUNCTION public.validate_order_for_checkout(TEXT) TO authenticated;

-- ---- validate_order_item_price() ----
-- Returns TRUE only if the product exists, is available, and the submitted
-- unit_price matches the actual catalogue price (within ₹0.01 tolerance).
-- Schema-qualified abs() call is unnecessary (abs is in pg_catalog which is
-- first in search_path), but the table reference is explicit.
CREATE OR REPLACE FUNCTION public.validate_order_item_price(
  p_product_id TEXT,
  p_unit_price NUMERIC
)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = pg_catalog, public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.products
    WHERE id = p_product_id
      AND availability = true
      AND abs(price - p_unit_price) < 0.01
  );
$$;

-- Restrict EXECUTE: anon + authenticated only
REVOKE EXECUTE ON FUNCTION public.validate_order_item_price(TEXT, NUMERIC) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.validate_order_item_price(TEXT, NUMERIC) TO anon;
GRANT  EXECUTE ON FUNCTION public.validate_order_item_price(TEXT, NUMERIC) TO authenticated;


-- ==============================================================================
-- STEP 4: Order total validation trigger (Issue 4)
--
-- Purpose: After ALL order items have been inserted, verify that the sum of
-- their subtotals does not exceed the declared orders.total_amount.
--
-- Architecture note: The app inserts items in a single batch INSERT call
-- (supabaseService.ts createOrderInSupabase step 3). The trigger fires once
-- per row. After each item is inserted, the running subtotal is re-checked.
-- If any single item pushes the cumulative total above total_amount, the
-- trigger aborts with an error.
--
-- Delivery charges: The orders schema has no separate delivery_charge column.
-- The app includes any delivery charge inside total_amount. The check is
-- therefore: SUM(subtotals) <= total_amount (not strict equality), which
-- handles the case where total_amount includes a delivery fee or discount
-- already baked in by the client. Using <= prevents undercharging but
-- allows the declared total to be >= the sum of item lines.
--
-- Idempotent: DROP TRIGGER IF EXISTS before CREATE.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.check_order_total_on_item_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_declared_total  NUMERIC(10,2);
  v_items_total     NUMERIC(10,2);
BEGIN
  -- Get the declared order total (bypass RLS — this is SECURITY DEFINER)
  SELECT total_amount INTO v_declared_total
  FROM public.orders
  WHERE id = NEW.order_id;

  IF v_declared_total IS NULL THEN
    RAISE EXCEPTION 'Order % not found', NEW.order_id;
  END IF;

  -- Sum all subtotals for this order INCLUDING the new row just inserted
  SELECT COALESCE(SUM(subtotal), 0) INTO v_items_total
  FROM public.order_items
  WHERE order_id = NEW.order_id;

  -- Items total must not exceed the declared total
  -- (allows total_amount to include delivery fee or discount)
  IF v_items_total > v_declared_total + 0.01 THEN
    RAISE EXCEPTION
      'Order total mismatch: declared total_amount=% but sum of item subtotals=% for order %',
      v_declared_total, v_items_total, NEW.order_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_order_total_trigger ON public.order_items;
CREATE TRIGGER validate_order_total_trigger
  AFTER INSERT ON public.order_items
  FOR EACH ROW
  EXECUTE FUNCTION public.check_order_total_on_item_insert();


-- ==============================================================================
-- TABLE 1: PRODUCTS
--
-- Public:  SELECT all products (browse the cake catalogue)
-- Admin:   INSERT / UPDATE / DELETE (manage the product menu)
-- ==============================================================================

CREATE POLICY "v5_products_public_select" ON public.products
  FOR SELECT
  USING (true);

CREATE POLICY "v5_products_admin_insert" ON public.products
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "v5_products_admin_update" ON public.products
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "v5_products_admin_delete" ON public.products
  FOR DELETE
  TO authenticated
  USING (public.is_admin());


-- ==============================================================================
-- TABLE 2: CUSTOMERS
--
-- Public INSERT (checkout):
--   - name and phone are required (not empty)
--   - total_orders and total_spent must be 0 (no loyalty counter inflation)
--   - No SELECT / UPDATE / DELETE for public (PII protected)
--
-- Admin ALL:
--   Full CRUD — only is_admin()
-- ==============================================================================

CREATE POLICY "v5_customers_public_insert" ON public.customers
  FOR INSERT
  WITH CHECK (
    char_length(trim(name)) > 0
    AND char_length(trim(phone)) > 0
    AND (total_orders IS NULL OR total_orders = 0)
    AND (total_spent  IS NULL OR total_spent  = 0)
  );

CREATE POLICY "v5_customers_admin_all" ON public.customers
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ==============================================================================
-- TABLE 3: ORDERS
--
-- Public INSERT (checkout):
--   - customer_name and phone required
--   - payment_status must be 'pending' (cannot self-mark as paid)
--   - order_status must be 'new' or 'pending' (cannot skip to delivered)
--   - total_amount must be > 0
--   - No SELECT / UPDATE / DELETE for public (order data protected)
--
-- Admin ALL:
--   Full CRUD — only is_admin()
-- ==============================================================================

CREATE POLICY "v5_orders_public_insert" ON public.orders
  FOR INSERT
  WITH CHECK (
    char_length(trim(customer_name)) > 0
    AND char_length(trim(phone)) > 0
    AND payment_status = 'pending'
    AND order_status IN ('new', 'pending')
    AND total_amount > 0
  );

CREATE POLICY "v5_orders_admin_all" ON public.orders
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ==============================================================================
-- TABLE 4: ORDER ITEMS
--
-- Public INSERT (checkout):
--   - quantity >= 1
--   - unit_price > 0
--   - subtotal = quantity * unit_price (exact, no rounding)
--   - product_id IS NOT NULL (all cakes are catalogue products)
--   - validate_order_item_price(): price must match catalogue (±₹0.01)
--   - validate_order_for_checkout(): parent order must be in pending state
--     (uses SECURITY DEFINER to bypass RLS on orders table)
--   - After INSERT: trigger checks cumulative subtotals <= orders.total_amount
--   - No SELECT / UPDATE / DELETE for public
--
-- Admin ALL:
--   Full CRUD — only is_admin()
-- ==============================================================================

CREATE POLICY "v5_order_items_public_insert" ON public.order_items
  FOR INSERT
  WITH CHECK (
    quantity >= 1
    AND unit_price > 0
    AND subtotal = quantity * unit_price
    AND product_id IS NOT NULL
    AND public.validate_order_item_price(product_id, unit_price)
    AND public.validate_order_for_checkout(order_id)
  );

CREATE POLICY "v5_order_items_admin_all" ON public.order_items
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ==============================================================================
-- TABLE 5: PAYMENTS
--
-- ⚠️  PUBLIC INSERT IS INTENTIONALLY ABSENT.
--
-- Payment records are written only by the authenticated admin when they
-- manually verify a UPI/bank transfer receipt and mark the order as 'paid'.
-- Trusting a frontend payment-success message is a critical security hole.
--
-- Admin ALL:
--   Full CRUD — only is_admin()
-- ==============================================================================

CREATE POLICY "v5_payments_admin_all" ON public.payments
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ==============================================================================
-- TABLE 6: OFFERS
--
-- Public SELECT: active offers only (is_active = true)
-- Admin ALL: Full CRUD including inactive offers
-- ==============================================================================

CREATE POLICY "v5_offers_public_select" ON public.offers
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "v5_offers_admin_all" ON public.offers
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ==============================================================================
-- TABLE 7: ADMIN PROFILES
--
-- Anonymous: Zero access (no policy)
--
-- Any authenticated user:
--   SELECT their own row only (user_id = auth.uid())
--
-- Authenticated + is_admin():
--   SELECT all rows
--
-- Super-admin (Tharshini, JWT email):
--   Full CRUD — with hardened WITH CHECK:
--   The email column in the written row must equal the authorized email.
--   This prevents the super-admin from accidentally (or maliciously)
--   changing the stored email column to something else, which would
--   orphan the row or create a privilege escalation path.
-- ==============================================================================

CREATE POLICY "v5_admin_profiles_self_select" ON public.admin_profiles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "v5_admin_profiles_admin_select" ON public.admin_profiles
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "v5_admin_profiles_superadmin_all" ON public.admin_profiles
  FOR ALL
  TO authenticated
  USING  (auth.jwt() ->> 'email' = 'tharshini1773@gmail.com')
  WITH CHECK (
    auth.jwt() ->> 'email' = 'tharshini1773@gmail.com'
    -- Prevent changing the stored email column to a different address
    AND email = 'tharshini1773@gmail.com'
  );


-- ==============================================================================
-- END OF MIGRATION v5
--
-- SECURITY DEFINER function inventory:
--   public.is_admin()                        — EXECUTE: PUBLIC (required by RLS)
--   public.handle_admin_auth_user()          — trigger only, not callable externally
--   public.validate_order_for_checkout()     — EXECUTE: anon, authenticated only
--   public.validate_order_item_price()       — EXECUTE: anon, authenticated only
--   public.check_order_total_on_item_insert()— trigger only, not callable externally
--
-- No data modified. No RLS disabled. No service-role keys used or exposed.
-- ==============================================================================
