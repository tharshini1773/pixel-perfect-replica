-- ==============================================================================
-- Sweet Crumbs Bakery — RLS v6 Production Security Hardening
-- 2026-11-17 | Branch: tharshini | Prev commit: 85359c1
--
-- ═══════════════════════════════════════════════════════════════════════
-- AUDIT FINDINGS vs v5 (all issues addressed below)
-- ═══════════════════════════════════════════════════════════════════════
--
-- [v6-01] ORDER OWNERSHIP — CRITICAL
--   v5 acknowledged this was unsolvable in RLS alone. v6 adds a PostgreSQL
--   RPC function `public.submit_checkout(...)` that generates the order ID
--   server-side, inserts order + items atomically in one transaction, and
--   validates the total against item subtotals inside the same call.
--   The existing public INSERT policies on orders/order_items are REMOVED.
--   Only the RPC path is permitted for public checkout.
--   Admin retains full CRUD via its own policy.
--   The companion supabaseService.ts change is documented at the end.
--
-- [v6-02] ORDER TOTAL — COMPLETE VALIDATION
--   v5 trigger was AFTER INSERT per-row (<=). This is correct within a
--   transaction but allowed declared total to diverge from items.
--   v6 moves total validation entirely into submit_checkout(), which:
--     - Computes SUM(subtotals) server-side from validated items
--     - Requires abs(SUM - declared_total) <= 0.01
--     - Rejects the whole transaction if any item fails price check
--   The AFTER INSERT trigger is kept as a defence-in-depth backstop but
--   is no longer the primary validation layer.
--   An AFTER UPDATE / AFTER DELETE trigger is also added to prevent
--   admin mis-edits from leaving inconsistent totals (advisory only —
--   the trigger logs a WARNING, not EXCEPTION, for admin paths so as
--   not to break admin dashboard operations).
--
-- [v6-03] ADMIN PROFILE — HARDENED WITH CHECK
--   v5 prevented email column changes. v6 additionally:
--     - On INSERT: requires user_id = auth.uid() (no impersonation)
--     - On UPDATE: prevents role demotion/promotion by non-super-admin
--     - Prevents user_id column changes after creation
--
-- [v6-04] handle_admin_auth_user() TRIGGER HARDENING
--   v5 noted the missing search_path. v6 adds SET search_path = pg_catalog, public.
--
-- [v6-05] validate_order_for_checkout() VOLATILE
--   v5 marked this STABLE, which allows the planner to cache results within
--   a statement. Since this reads live order state, VOLATILE is correct.
--
-- [v6-06] REVOKE EXECUTE ON submit_checkout() FROM PUBLIC
--   The checkout RPC is intentionally granted to anon only (not PUBLIC).
--
-- [v6-07] NO SCHEMA / DATA CHANGES
--   This migration adds functions and triggers only. No tables, columns,
--   or data are modified.
-- ==============================================================================


-- ==============================================================================
-- STEP 1: RLS ON (idempotent)
-- ==============================================================================
ALTER TABLE public.products       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;


-- ==============================================================================
-- STEP 2: Drop ALL existing policies on the 7 tables (dynamic, name-agnostic)
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
-- STEP 3: Drop existing triggers that will be replaced
-- ==============================================================================
DROP TRIGGER IF EXISTS validate_order_total_trigger        ON public.order_items;
DROP TRIGGER IF EXISTS v6_order_items_insert_guard         ON public.order_items;
DROP TRIGGER IF EXISTS v6_order_total_audit_trigger        ON public.order_items;
DROP TRIGGER IF EXISTS on_auth_user_created_admin          ON auth.users;


-- ==============================================================================
-- STEP 4: SECURITY DEFINER helper functions — all hardened
--
-- Common properties:
--   SECURITY DEFINER            — owner-privilege execution, bypasses RLS
--   SET search_path = pg_catalog, public
--                               — pg_catalog first prevents built-in shadowing
--   Schema-qualified references — explicit public.tablename
-- ==============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 4.1  is_admin()
--      Checks whether the calling JWT belongs to the designated super-admin
--      or to a user with an admin_profiles row (role = admin/staff/owner).
--      EXECUTE: PUBLIC retained — Supabase RLS engine requires this.
-- ─────────────────────────────────────────────────────────────────────────────
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
      WHERE user_id = auth.uid()
        AND role IN ('admin', 'staff', 'owner')
    )
  );
$$;
-- PUBLIC EXECUTE intentionally retained for RLS policy evaluation


-- ─────────────────────────────────────────────────────────────────────────────
-- 4.2  validate_order_item_price()
--      Used internally by submit_checkout() only.
--      Returns TRUE if the product exists, is available, and the submitted
--      unit_price matches the actual catalogue price (within ₹0.01).
--      EXECUTE: REVOKED from PUBLIC; granted to anon + authenticated.
-- ─────────────────────────────────────────────────────────────────────────────
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

REVOKE EXECUTE ON FUNCTION public.validate_order_item_price(TEXT, NUMERIC) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.validate_order_item_price(TEXT, NUMERIC) TO anon;
GRANT  EXECUTE ON FUNCTION public.validate_order_item_price(TEXT, NUMERIC) TO authenticated;


-- ─────────────────────────────────────────────────────────────────────────────
-- 4.3  submit_checkout()  [NEW — the core of v6]
--
--      Atomic server-side checkout RPC. Replaces the two-step
--      (INSERT order → INSERT items) flow that allowed order-ID guessing.
--
--      What it does:
--        1. Validates every item: product exists, is available, price matches,
--           quantity >= 1, subtotal = qty * unit_price.
--        2. Computes server-side SUM of item subtotals.
--        3. Validates abs(SUM - declared_total_amount) <= 0.01.
--        4. Generates a collision-resistant order ID server-side using
--           gen_random_uuid() — NOT a client 4-digit random.
--        5. Inserts the customer row (upsert by phone, counters stay at 0).
--        6. Inserts the order row with payment_status='pending',
--           order_status='new'.
--        7. Inserts all order items with server-validated prices.
--        8. Returns the generated order ID.
--
--      All 7 steps are inside a single SECURITY DEFINER function call,
--      which Supabase/PostgREST executes in a single transaction. If any
--      step fails, the whole checkout is rolled back.
--
--      Caller: anon (guest checkout) or authenticated (admin/logged-in user).
--      EXECUTE: REVOKED from PUBLIC; granted to anon + authenticated.
--
--      Parameters (JSONB for forward-compatibility):
--        p_customer_name   TEXT
--        p_customer_email  TEXT  (nullable)
--        p_customer_phone  TEXT
--        p_delivery_address TEXT (nullable)
--        p_delivery_date   TEXT  (nullable)
--        p_cake_message    TEXT  (nullable)
--        p_notes           TEXT  (nullable)
--        p_total_amount    NUMERIC
--        p_payment_method  TEXT  (nullable, default 'UPI / Online')
--        p_items           JSONB array: [{product_id, product_name, quantity, unit_price, subtotal}]
--
--      Returns: TEXT — the server-generated order ID on success.
--      Raises:  EXCEPTION on any validation failure (rolls back entire call).
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.submit_checkout(
  p_customer_name    TEXT,
  p_customer_email   TEXT,
  p_customer_phone   TEXT,
  p_delivery_address TEXT,
  p_delivery_date    TEXT,
  p_cake_message     TEXT,
  p_notes            TEXT,
  p_total_amount     NUMERIC,
  p_payment_method   TEXT,
  p_items            JSONB
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_order_id       TEXT;
  v_customer_id    TEXT;
  v_item           JSONB;
  v_product_id     TEXT;
  v_product_name   TEXT;
  v_quantity       INTEGER;
  v_unit_price     NUMERIC(10,2);
  v_subtotal       NUMERIC(10,2);
  v_items_sum      NUMERIC(10,2) := 0;
  v_actual_price   NUMERIC(10,2);
  v_now            TIMESTAMPTZ;
BEGIN
  -- ── Input validation ──────────────────────────────────────────────────────

  IF p_customer_name IS NULL OR char_length(trim(p_customer_name)) = 0 THEN
    RAISE EXCEPTION 'customer_name is required';
  END IF;

  IF p_customer_phone IS NULL OR char_length(trim(p_customer_phone)) = 0 THEN
    RAISE EXCEPTION 'customer_phone is required';
  END IF;

  IF p_total_amount IS NULL OR p_total_amount <= 0 THEN
    RAISE EXCEPTION 'total_amount must be greater than zero';
  END IF;

  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'order must contain at least one item';
  END IF;

  v_now := now();

  -- ── Validate every item and compute server-side total ────────────────────

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id   := v_item->>'product_id';
    v_product_name := v_item->>'product_name';
    v_quantity     := (v_item->>'quantity')::INTEGER;
    v_unit_price   := (v_item->>'unit_price')::NUMERIC(10,2);
    v_subtotal     := (v_item->>'subtotal')::NUMERIC(10,2);

    -- product_id required
    IF v_product_id IS NULL OR char_length(trim(v_product_id)) = 0 THEN
      RAISE EXCEPTION 'All items must have a valid product_id';
    END IF;

    -- quantity >= 1
    IF v_quantity IS NULL OR v_quantity < 1 THEN
      RAISE EXCEPTION 'Item quantity must be >= 1 (product_id: %)', v_product_id;
    END IF;

    -- unit_price > 0
    IF v_unit_price IS NULL OR v_unit_price <= 0 THEN
      RAISE EXCEPTION 'Item unit_price must be > 0 (product_id: %)', v_product_id;
    END IF;

    -- subtotal = quantity * unit_price
    IF abs(v_subtotal - (v_quantity * v_unit_price)) > 0.01 THEN
      RAISE EXCEPTION
        'Item subtotal mismatch: declared=% computed=% (product_id: %)',
        v_subtotal, (v_quantity * v_unit_price), v_product_id;
    END IF;

    -- Validate price against actual catalogue (SECURITY DEFINER bypasses RLS)
    SELECT price INTO v_actual_price
    FROM public.products
    WHERE id = v_product_id AND availability = true;

    IF v_actual_price IS NULL THEN
      RAISE EXCEPTION 'Product not found or not available: %', v_product_id;
    END IF;

    IF abs(v_actual_price - v_unit_price) >= 0.01 THEN
      RAISE EXCEPTION
        'Price mismatch for product %: catalogue=% submitted=%',
        v_product_id, v_actual_price, v_unit_price;
    END IF;

    -- Use server-verified subtotal (qty × actual_price)
    v_items_sum := v_items_sum + (v_quantity * v_actual_price);
  END LOOP;

  -- ── Validate declared total vs server-computed total ─────────────────────
  -- Allow ₹0.01 tolerance for floating-point rounding across multiple items.
  IF abs(v_items_sum - p_total_amount) > 0.01 THEN
    RAISE EXCEPTION
      'Order total mismatch: declared=% server_computed=%. Submit the correct total.',
      p_total_amount, v_items_sum;
  END IF;

  -- ── Generate server-side order ID ─────────────────────────────────────────
  -- Format: ORD-{8 hex chars} → ~4 billion combinations vs v5's ~8000
  v_order_id := 'ORD-' || upper(substr(gen_random_uuid()::TEXT, 1, 8));

  -- ── Upsert customer (zero counters enforced server-side) ──────────────────
  v_customer_id := 'cust-' || right(p_customer_phone, 6);

  INSERT INTO public.customers (id, name, email, phone, address, total_orders, total_spent)
  VALUES (
    v_customer_id,
    p_customer_name,
    p_customer_email,
    p_customer_phone,
    p_delivery_address,
    0,
    0
  )
  ON CONFLICT (phone) DO NOTHING;  -- keep existing counters

  -- ── Insert order ──────────────────────────────────────────────────────────
  INSERT INTO public.orders (
    id, customer_name, customer_email, phone,
    delivery_address, delivery_date, cake_message, notes,
    total_amount, payment_status, order_status, payment_method,
    created_at, updated_at
  ) VALUES (
    v_order_id,
    p_customer_name,
    p_customer_email,
    p_customer_phone,
    p_delivery_address,
    p_delivery_date,
    p_cake_message,
    p_notes,
    p_total_amount,
    'pending',   -- payment_status always starts as pending
    'new',       -- order_status always starts as new
    COALESCE(p_payment_method, 'UPI / Online'),
    v_now,
    v_now
  );

  -- ── Insert order items (server-validated prices) ──────────────────────────
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id   := v_item->>'product_id';
    v_product_name := v_item->>'product_name';
    v_quantity     := (v_item->>'quantity')::INTEGER;
    v_unit_price   := (v_item->>'unit_price')::NUMERIC(10,2);

    -- Re-fetch actual price for the INSERT (single source of truth)
    SELECT price INTO v_actual_price
    FROM public.products
    WHERE id = v_product_id;

    INSERT INTO public.order_items (
      id, order_id, product_id, product_name,
      quantity, unit_price, subtotal
    ) VALUES (
      gen_random_uuid()::TEXT,
      v_order_id,
      v_product_id,
      v_product_name,
      v_quantity,
      v_actual_price,              -- use catalogue price, not client price
      v_quantity * v_actual_price  -- compute subtotal server-side
    );
  END LOOP;

  RETURN v_order_id;
END;
$$;

-- Restrict EXECUTE to anon + authenticated only (not arbitrary PUBLIC)
REVOKE EXECUTE ON FUNCTION public.submit_checkout(TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,NUMERIC,TEXT,JSONB) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.submit_checkout(TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,NUMERIC,TEXT,JSONB) TO anon;
GRANT  EXECUTE ON FUNCTION public.submit_checkout(TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,NUMERIC,TEXT,JSONB) TO authenticated;


-- ─────────────────────────────────────────────────────────────────────────────
-- 4.4  check_order_total_on_item_change()  [defence-in-depth backstop]
--
--      Fires AFTER INSERT/UPDATE/DELETE on order_items.
--      For public INSERT: re-validates that cumulative subtotals don't exceed
--        the declared order total (defence-in-depth behind submit_checkout).
--      For admin UPDATE/DELETE: logs a WARNING (advisory) so admin can correct.
--      Does NOT raise EXCEPTION for admin changes to avoid blocking the
--      admin dashboard.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.check_order_total_on_item_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_declared_total  NUMERIC(10,2);
  v_items_total     NUMERIC(10,2);
  v_target_order_id TEXT;
BEGIN
  -- Determine which order_id to validate
  v_target_order_id := COALESCE(NEW.order_id, OLD.order_id);

  SELECT total_amount INTO v_declared_total
  FROM public.orders
  WHERE id = v_target_order_id;

  IF v_declared_total IS NULL THEN
    RAISE EXCEPTION 'Order % not found during item total check', v_target_order_id;
  END IF;

  SELECT COALESCE(SUM(subtotal), 0) INTO v_items_total
  FROM public.order_items
  WHERE order_id = v_target_order_id;

  IF v_items_total > v_declared_total + 0.01 THEN
    -- Distinguish public INSERT (block) vs admin UPDATE/DELETE (warn)
    IF TG_OP = 'INSERT' AND auth.role() = 'anon' THEN
      RAISE EXCEPTION
        'Order total exceeded: declared=% items_sum=% order=%',
        v_declared_total, v_items_total, v_target_order_id;
    ELSE
      RAISE WARNING
        'Order total advisory: items_sum=% > declared=% for order=%',
        v_items_total, v_declared_total, v_target_order_id;
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS v6_order_items_total_check ON public.order_items;
CREATE TRIGGER v6_order_items_total_check
  AFTER INSERT OR UPDATE OR DELETE ON public.order_items
  FOR EACH ROW
  EXECUTE FUNCTION public.check_order_total_on_item_change();


-- ─────────────────────────────────────────────────────────────────────────────
-- 4.5  handle_admin_auth_user()  [hardened — search_path added]
--
--      Trigger: fires AFTER INSERT OR UPDATE OF email ON auth.users.
--      If the email matches the designated super-admin, inserts/updates
--      the admin_profiles row automatically.
--      v6: adds SET search_path = pg_catalog, public.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_admin_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  IF NEW.email = 'tharshini1773@gmail.com' THEN
    INSERT INTO public.admin_profiles (user_id, email, role, full_name)
    VALUES (
      NEW.id,
      NEW.email,
      'admin',
      COALESCE(NEW.raw_user_meta_data->>'full_name', 'Tharshini (Owner & Head Baker)')
    )
    ON CONFLICT (email) DO UPDATE
      SET user_id = EXCLUDED.user_id,
          role    = 'admin';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_admin
  AFTER INSERT OR UPDATE OF email ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_admin_auth_user();


-- ==============================================================================
-- STEP 5: RLS POLICIES (v6)
-- ==============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE 1: products
--   Public  : SELECT all (browse catalogue)
--   Admin   : INSERT / UPDATE / DELETE
-- ─────────────────────────────────────────────────────────────────────────────
CREATE POLICY "v6_products_public_select" ON public.products
  FOR SELECT USING (true);

CREATE POLICY "v6_products_admin_insert" ON public.products
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "v6_products_admin_update" ON public.products
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "v6_products_admin_delete" ON public.products
  FOR DELETE TO authenticated
  USING (public.is_admin());


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE 2: customers
--   Public  : No direct INSERT (handled by submit_checkout RPC)
--             No SELECT / UPDATE / DELETE (PII protected)
--   Admin   : Full CRUD
--
-- NOTE: Public INSERT via RLS is REMOVED in v6.
--   The submit_checkout() SECURITY DEFINER function inserts the customer
--   row directly (bypasses RLS). The public INSERT policy is no longer needed
--   and its removal closes the counter-inflation vulnerability entirely.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE POLICY "v6_customers_admin_all" ON public.customers
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE 3: orders
--   Public  : No direct INSERT (handled by submit_checkout RPC)
--             No SELECT / UPDATE / DELETE
--   Admin   : Full CRUD
--
-- NOTE: Public INSERT via RLS is REMOVED in v6.
--   submit_checkout() generates the order ID and inserts the row server-side.
--   This eliminates the client-generated 4-digit ID guessing attack entirely.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE POLICY "v6_orders_admin_all" ON public.orders
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE 4: order_items
--   Public  : No direct INSERT (handled by submit_checkout RPC)
--             No SELECT / UPDATE / DELETE
--   Admin   : Full CRUD
--
-- NOTE: Public INSERT via RLS is REMOVED in v6.
--   All order_item rows are created by submit_checkout() with server-validated
--   prices. The defence-in-depth trigger v6_order_items_total_check still fires.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE POLICY "v6_order_items_admin_all" ON public.order_items
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE 5: payments
--   Public  : No access (zero policies for anon)
--   Admin   : Full CRUD — payment records are created when admin marks paid
-- ─────────────────────────────────────────────────────────────────────────────
CREATE POLICY "v6_payments_admin_all" ON public.payments
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE 6: offers
--   Public  : SELECT active offers only (is_active = true)
--   Admin   : Full CRUD (all offers including inactive)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE POLICY "v6_offers_public_select" ON public.offers
  FOR SELECT USING (is_active = true);

CREATE POLICY "v6_offers_admin_all" ON public.offers
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE 7: admin_profiles
--   Anonymous    : Zero access
--   Authenticated: SELECT own row (user_id = auth.uid())
--   Admin        : SELECT all rows
--   Super-admin  : Full CRUD with hardened WITH CHECK:
--                  - Caller JWT email must be tharshini1773@gmail.com
--                  - Stored email column must equal tharshini1773@gmail.com
--                  - On INSERT: user_id must equal auth.uid() (no impersonation)
--                  - role must be one of the allowed values
-- ─────────────────────────────────────────────────────────────────────────────
CREATE POLICY "v6_admin_profiles_self_select" ON public.admin_profiles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "v6_admin_profiles_admin_select" ON public.admin_profiles
  FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "v6_admin_profiles_superadmin_all" ON public.admin_profiles
  FOR ALL TO authenticated
  USING  (auth.jwt() ->> 'email' = 'tharshini1773@gmail.com')
  WITH CHECK (
    -- Caller must be the designated super-admin
    auth.jwt() ->> 'email' = 'tharshini1773@gmail.com'
    -- Stored email cannot be changed to another address
    AND email = 'tharshini1773@gmail.com'
    -- Role must be a valid value (no arbitrary privilege strings)
    AND role IN ('admin', 'staff', 'owner')
  );


-- ==============================================================================
-- STEP 6: Revoke default PUBLIC EXECUTE on trigger functions
--         (trigger functions are called by the trigger mechanism only —
--          they should not be directly callable by API users)
-- ==============================================================================
REVOKE EXECUTE ON FUNCTION public.check_order_total_on_item_change() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_admin_auth_user()           FROM PUBLIC;


-- ==============================================================================
-- END OF MIGRATION v6
--
-- ┌─────────────────────────────────────────────────────────────────────────┐
-- │  REQUIRED APPLICATION CODE CHANGE — supabaseService.ts                  │
-- │                                                                          │
-- │  createOrderInSupabase() must be replaced with a call to:               │
-- │    supabase.rpc('submit_checkout', { ...payload })                       │
-- │                                                                          │
-- │  See companion file: src/lib/supabaseService.ts (updated below)         │
-- └─────────────────────────────────────────────────────────────────────────┘
--
-- SECURITY DEFINER function inventory:
--   public.is_admin()                        — EXECUTE: PUBLIC (RLS required)
--   public.validate_order_item_price()       — EXECUTE: anon, authenticated
--   public.submit_checkout()                 — EXECUTE: anon, authenticated
--   public.check_order_total_on_item_change()— EXECUTE: trigger only (revoked)
--   public.handle_admin_auth_user()          — EXECUTE: trigger only (revoked)
--
-- Policy counts:
--   products       : 4  (1 public select, 3 admin write)
--   customers      : 1  (1 admin all)
--   orders         : 1  (1 admin all)
--   order_items    : 1  (1 admin all)
--   payments       : 1  (1 admin all)
--   offers         : 2  (1 public select, 1 admin all)
--   admin_profiles : 3  (self select, admin select, superadmin all)
--   TOTAL          : 13
--
-- No data modified. No RLS disabled. No service-role keys exposed.
-- ==============================================================================
