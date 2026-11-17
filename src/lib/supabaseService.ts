/**
 * Sweet Crumbs Bakery — Supabase Service Layer
 * Phase 5–7: Products, Orders, Customers, Offers CRUD with RLS-safe queries
 * Falls back gracefully when tables haven't been migrated yet.
 */

import {
  supabase,
  type DbProduct,
  type DbCustomer,
  type DbOrder,
  type DbOrderItem,
  type DbOffer,
  type DbPayment,
} from "./supabase";

// ============================================================
// HELPERS
// ============================================================

/** Returns true if the error is "table not found" – migration not yet run */
export function isTableMissing(error: any): boolean {
  return error?.code === "PGRST205" || error?.code === "42P01";
}

/** Generic safe-fetch that works with Supabase's thenable builders */
async function safeQuery<T>(
  queryFn: () => PromiseLike<{ data: T | null; error: any }>,
  fallback: T,
): Promise<T> {
  try {
    const { data, error } = await queryFn();
    if (error) {
      if (!isTableMissing(error)) {
        console.warn("[Supabase]", error.message, error.code);
      }
      return fallback;
    }
    return data ?? fallback;
  } catch (err: any) {
    console.warn("[Supabase] Exception:", err?.message);
    return fallback;
  }
}

// ============================================================
// PRODUCTS SERVICE
// ============================================================

export async function fetchProducts(): Promise<DbProduct[]> {
  return safeQuery<DbProduct[]>(
    () => supabase.from("products").select("*").order("created_at", { ascending: false }) as any,
    [],
  );
}

export async function fetchProductById(id: string): Promise<DbProduct | null> {
  return safeQuery<DbProduct | null>(
    () => supabase.from("products").select("*").eq("id", id).single() as any,
    null,
  );
}

export async function upsertProduct(
  product: Omit<DbProduct, "created_at" | "updated_at">,
): Promise<DbProduct | null> {
  try {
    const { data, error } = await (supabase
      .from("products")
      .upsert({ ...product, updated_at: new Date().toISOString() }, { onConflict: "id" })
      .select()
      .single() as any);
    if (error) {
      if (!isTableMissing(error)) console.warn("[Supabase] upsertProduct:", error.message);
      return null;
    }
    return data as DbProduct;
  } catch {
    return null;
  }
}

export async function updateProduct(
  id: string,
  updates: Partial<DbProduct>,
): Promise<boolean> {
  try {
    const { error } = await (supabase
      .from("products")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id) as any);
    if (error) {
      if (!isTableMissing(error)) console.warn("[Supabase] updateProduct:", error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function deleteProduct(id: string): Promise<boolean> {
  try {
    const { error } = await (supabase.from("products").delete().eq("id", id) as any);
    if (error) {
      if (!isTableMissing(error)) console.warn("[Supabase] deleteProduct:", error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function toggleProductAvailability(
  id: string,
  availability: boolean,
): Promise<boolean> {
  return updateProduct(id, { availability });
}

// ============================================================
// CUSTOMERS SERVICE
// ============================================================

export async function fetchCustomers(): Promise<DbCustomer[]> {
  return safeQuery<DbCustomer[]>(
    () =>
      supabase
        .from("customers")
        .select("*")
        .order("total_spent", { ascending: false }) as any,
    [],
  );
}

export async function fetchCustomerByPhone(phone: string): Promise<DbCustomer | null> {
  return safeQuery<DbCustomer | null>(
    () => supabase.from("customers").select("*").eq("phone", phone).single() as any,
    null,
  );
}

export async function upsertCustomer(
  customer: Omit<DbCustomer, "created_at">,
): Promise<DbCustomer | null> {
  try {
    const { data, error } = await (supabase
      .from("customers")
      .upsert(customer, { onConflict: "phone" })
      .select()
      .single() as any);
    if (error) {
      if (!isTableMissing(error)) console.warn("[Supabase] upsertCustomer:", error.message);
      return null;
    }
    return data as DbCustomer;
  } catch {
    return null;
  }
}

// ============================================================
// ORDERS SERVICE
// ============================================================

export async function fetchOrders(): Promise<DbOrder[]> {
  return safeQuery<DbOrder[]>(
    () =>
      supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false }) as any,
    [],
  );
}

export async function fetchOrderById(id: string): Promise<DbOrder | null> {
  return safeQuery<DbOrder | null>(
    () =>
      supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("id", id)
        .single() as any,
    null,
  );
}

export interface CreateOrderPayload {
  id: string;
  customerName: string;
  customerEmail?: string | undefined;
  customerPhone: string;
  deliveryAddress?: string | undefined;
  deliveryDate?: string | undefined;
  cakeMessage?: string | undefined;
  notes?: string | undefined;
  totalAmount: number;
  paymentMethod?: string | undefined;
  items: Array<{
    id?: string | undefined;
    productId?: string | undefined;
    productName: string;
    quantity: number;
    price: number;
    total: number;
  }>;
}

export async function createOrderInSupabase(
  payload: CreateOrderPayload,
): Promise<DbOrder | null> {
  const now = new Date().toISOString();

  try {
    // 1. Upsert customer — INSERT with zero counters (RLS enforces this),
    //    then UPDATE counters separately (admin policy handles that path
    //    when admin is signed in; otherwise counters stay at zero until admin sync)
    await (supabase
      .from("customers")
      .upsert(
        {
          id: `cust-${payload.customerPhone.slice(-6)}`,
          name: payload.customerName,
          email: payload.customerEmail ?? null,
          phone: payload.customerPhone,
          address: payload.deliveryAddress ?? null,
          total_orders: 0,
          total_spent: 0,
        },
        { onConflict: "phone", ignoreDuplicates: true },   // keep existing counters
      )
      .select("id")
      .single() as any);

    // 2. Insert Order
    const { data: order, error: ordErr } = await (supabase
      .from("orders")
      .insert({
        id: payload.id,
        customer_name: payload.customerName,
        customer_email: payload.customerEmail ?? null,
        phone: payload.customerPhone,
        delivery_address: payload.deliveryAddress ?? null,
        delivery_date: payload.deliveryDate ?? null,
        cake_message: payload.cakeMessage ?? null,
        notes: payload.notes ?? null,
        total_amount: payload.totalAmount,
        payment_status: "pending",
        order_status: "new",
        payment_method: payload.paymentMethod ?? "UPI / Online",
        created_at: now,
        updated_at: now,
      })
      .select()
      .single() as any);

    if (ordErr) {
      if (!isTableMissing(ordErr)) console.warn("[Supabase] createOrder:", ordErr.message);
      return null;
    }

    // 3. Insert Order Items
    if (payload.items.length > 0) {
      const items: DbOrderItem[] = payload.items.map((it) => ({
        id: it.id ?? crypto.randomUUID(),
        order_id: payload.id,
        product_id: it.productId ?? null,
        product_name: it.productName,
        quantity: it.quantity,
        unit_price: it.price,
        subtotal: it.total,
      }));
      const { error: itemsErr } = await (supabase.from("order_items").insert(items) as any);
      if (itemsErr && !isTableMissing(itemsErr)) {
        console.warn("[Supabase] insertOrderItems:", itemsErr.message);
      }
    }

    // Payment record is intentionally NOT inserted here.
    // Per secure payment flow: orders are placed with payment_status = 'pending'.
    // The admin verifies payment receipt manually and marks the order as 'paid'
    // in the dashboard — which triggers sbUpdateOrderPaymentStatus().
    // The payments table RLS blocks all public INSERT; only admin can write payments.

    return order as DbOrder;
  } catch (err: any) {
    console.warn("[Supabase] createOrderInSupabase exception:", err?.message);
    return null;
  }
}

export async function updateOrderStatus(
  orderId: string,
  orderStatus: DbOrder["order_status"],
): Promise<boolean> {
  try {
    const { error } = await (supabase
      .from("orders")
      .update({ order_status: orderStatus, updated_at: new Date().toISOString() })
      .eq("id", orderId) as any);
    if (error) {
      if (!isTableMissing(error)) console.warn("[Supabase] updateOrderStatus:", error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function updateOrderPaymentStatus(
  orderId: string,
  paymentStatus: DbOrder["payment_status"],
): Promise<boolean> {
  try {
    // 1. Update the order's payment_status
    const { error } = await (supabase
      .from("orders")
      .update({ payment_status: paymentStatus, updated_at: new Date().toISOString() })
      .eq("id", orderId) as any);
    if (error) {
      if (!isTableMissing(error)) console.warn("[Supabase] updateOrderPaymentStatus:", error.message);
      return false;
    }

    // 2. When admin marks order as 'paid', create the authoritative payment record.
    //    This runs with the admin's authenticated session, so the payments RLS allows it.
    if (paymentStatus === "paid") {
      // Fetch order details to build the payment record
      const { data: order } = await (supabase
        .from("orders")
        .select("total_amount, payment_method")
        .eq("id", orderId)
        .single() as any);

      if (order) {
        // Check if a payment record already exists for this order
        const { data: existing } = await (supabase
          .from("payments")
          .select("id")
          .eq("order_id", orderId)
          .single() as any);

        if (existing) {
          // Update existing payment record
          await (supabase
            .from("payments")
            .update({ payment_status: "paid" })
            .eq("order_id", orderId) as any);
        } else {
          // Insert authoritative payment record (admin-only, authenticated session)
          await (supabase.from("payments").insert({
            id: crypto.randomUUID(),
            order_id: orderId,
            payment_method: order.payment_method ?? "UPI / Online",
            amount: order.total_amount,
            payment_status: "paid",
            created_at: new Date().toISOString(),
          }) as any);
        }
      }
    } else {
      // For non-paid statuses (refunded, failed), update existing payment record if present
      await (supabase
        .from("payments")
        .update({ payment_status: paymentStatus })
        .eq("order_id", orderId) as any);
    }

    return true;
  } catch {
    return false;
  }
}

export async function deleteOrderFromSupabase(orderId: string): Promise<boolean> {
  try {
    const { error } = await (supabase.from("orders").delete().eq("id", orderId) as any);
    if (error) {
      if (!isTableMissing(error)) console.warn("[Supabase] deleteOrder:", error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

// ============================================================
// PAYMENTS SERVICE
// ============================================================

export async function fetchPayments(): Promise<DbPayment[]> {
  return safeQuery<DbPayment[]>(
    () =>
      supabase
        .from("payments")
        .select("*")
        .order("created_at", { ascending: false }) as any,
    [],
  );
}

// ============================================================
// OFFERS SERVICE
// ============================================================

export async function fetchOffers(onlyActive = false): Promise<DbOffer[]> {
  return safeQuery<DbOffer[]>(
    () => {
      let q = supabase.from("offers").select("*").order("created_at", { ascending: false });
      if (onlyActive) q = q.eq("is_active", true);
      return q as any;
    },
    [],
  );
}

export async function upsertOffer(
  offer: Omit<DbOffer, "created_at">,
): Promise<DbOffer | null> {
  try {
    const { data, error } = await (supabase
      .from("offers")
      .upsert(offer, { onConflict: "id" })
      .select()
      .single() as any);
    if (error) {
      if (!isTableMissing(error)) console.warn("[Supabase] upsertOffer:", error.message);
      return null;
    }
    return data as DbOffer;
  } catch {
    return null;
  }
}

export async function updateOffer(
  id: string,
  updates: Partial<DbOffer>,
): Promise<boolean> {
  try {
    const { error } = await (supabase.from("offers").update(updates).eq("id", id) as any);
    if (error) {
      if (!isTableMissing(error)) console.warn("[Supabase] updateOffer:", error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function toggleOfferActive(id: string, isActive: boolean): Promise<boolean> {
  return updateOffer(id, { is_active: isActive });
}

export async function deleteOfferFromSupabase(id: string): Promise<boolean> {
  try {
    const { error } = await (supabase.from("offers").delete().eq("id", id) as any);
    if (error) {
      if (!isTableMissing(error)) console.warn("[Supabase] deleteOffer:", error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

// ============================================================
// DASHBOARD AGGREGATES (Phase 5)
// ============================================================

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  pendingOrders: number;
  completedOrders: number;
  totalProducts: number;
  activeOffers: number;
  connected: boolean;
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  try {
    const [ordersRes, customersRes, productsRes, offersRes] = await Promise.all([
      (supabase.from("orders").select("id,total_amount,order_status") as any),
      (supabase.from("customers").select("id") as any),
      (supabase.from("products").select("id") as any),
      (supabase.from("offers").select("id,is_active") as any),
    ]);

    // If any table is missing, return zeros but flag not connected/ready
    if (
      isTableMissing(ordersRes.error) ||
      isTableMissing(customersRes.error) ||
      isTableMissing(productsRes.error)
    ) {
      return {
        totalRevenue: 0,
        totalOrders: 0,
        totalCustomers: 0,
        pendingOrders: 0,
        completedOrders: 0,
        totalProducts: 0,
        activeOffers: 0,
        connected: false,
      };
    }

    const orders: any[] = ordersRes.data ?? [];
    const customers: any[] = customersRes.data ?? [];
    const products: any[] = productsRes.data ?? [];
    const offers: any[] = offersRes.data ?? [];

    const totalRevenue = orders.reduce(
      (sum: number, o: any) => sum + (parseFloat(o.total_amount) || 0),
      0,
    );
    const pendingOrders = orders.filter(
      (o: any) => o.order_status === "pending" || o.order_status === "new",
    ).length;
    const completedOrders = orders.filter(
      (o: any) => o.order_status === "delivered",
    ).length;
    const activeOffers = offers.filter((of: any) => of.is_active).length;

    return {
      totalRevenue,
      totalOrders: orders.length,
      totalCustomers: customers.length,
      pendingOrders,
      completedOrders,
      totalProducts: products.length,
      activeOffers,
      connected: true,
    };
  } catch (err: any) {
    console.warn("[Supabase] fetchDashboardStats failed:", err?.message);
    return {
      totalRevenue: 0,
      totalOrders: 0,
      totalCustomers: 0,
      pendingOrders: 0,
      completedOrders: 0,
      totalProducts: 0,
      activeOffers: 0,
      connected: false,
    };
  }
}
