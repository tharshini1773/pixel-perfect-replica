import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Read Supabase credentials from Vite environment or preconfigured production project
// Safe environment retrieval across Vite browser, SSR and Node test environments
const getEnvVar = (key: string): string | undefined => {
  if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key] as string;
  }
  if (typeof process !== "undefined" && process.env && process.env[key]) {
    return process.env[key];
  }
  return undefined;
};

const envUrl = getEnvVar("VITE_SUPABASE_URL")?.trim();
const envAnonKey = getEnvVar("VITE_SUPABASE_ANON_KEY")?.trim();

export const SUPABASE_URL =
  envUrl && envUrl.startsWith("http") ? envUrl : "https://uyagsgruwuepaemutywn.supabase.co";

export const SUPABASE_ANON_KEY =
  envAnonKey || "sb_publishable_syIV5TZWqLBCh-ADpL7LHg_lV-mXn0m";

export const AUTHORIZED_ADMIN_EMAIL = "tharshini1773@gmail.com";

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL &&
    SUPABASE_ANON_KEY &&
    SUPABASE_URL.startsWith("http") &&
    !SUPABASE_URL.includes("placeholder"),
);

// Browser Supabase client (Uses ONLY the public anon / publishable key; never privileged keys)
export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: "sweet_crumbs_supabase_auth_session",
  },
});

// ================= DATABASE SCHEMAS & INTERFACES =================

export interface DbProduct {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  category: string;
  image_url: string;
  availability: boolean;
  weight?: string | null;
  stock?: number;
  created_at?: string;
  updated_at?: string;
}

export interface DbCustomer {
  id: string;
  name: string;
  email?: string | null;
  phone: string;
  address?: string | null;
  total_orders?: number;
  total_spent?: number;
  created_at?: string;
}

export interface DbOrder {
  id: string;
  customer_id?: string | null;
  customer_name: string;
  customer_email?: string | null;
  phone: string;
  delivery_address?: string | null;
  delivery_date?: string | null;
  cake_message?: string | null;
  notes?: string | null;
  total_amount: number;
  payment_status: "pending" | "paid" | "failed" | "refunded";
  order_status: "new" | "pending" | "confirmed" | "preparing" | "ready" | "out-for-delivery" | "delivered" | "cancelled";
  payment_method?: string | null;
  created_at?: string;
  updated_at?: string;
  order_items?: DbOrderItem[];
}

export interface DbOrderItem {
  id?: string;
  order_id: string;
  product_id?: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at?: string;
}

export interface DbPayment {
  id: string;
  order_id?: string | null;
  payment_method: string;
  transaction_id?: string | null;
  amount: number;
  payment_status: "pending" | "paid" | "failed" | "refunded";
  created_at?: string;
}

export interface DbOffer {
  id: string;
  title: string;
  description?: string | null;
  discount_percentage: number;
  coupon_code?: string | null;
  banner_text?: string | null;
  start_date?: string | null;
  expiry_date?: string | null;
  is_active: boolean;
  created_at?: string;
}

export interface DbAdminProfile {
  id: string;
  user_id: string;
  email: string;
  role: "admin" | "staff" | "owner";
  full_name?: string | null;
  created_at?: string;
}

// Connection Health Check Helper
export async function checkSupabaseConnection(): Promise<{
  connected: boolean;
  url: string;
  message: string;
}> {
  try {
    const start = performance.now();
    // Safe query: ping auth endpoint or products count
    const { error } = await supabase.from("products").select("id").limit(1);
    const latency = Math.round(performance.now() - start);

    // If PGRST205 (table not yet created), the connection itself is alive and verified!
    if (!error || error.code === "PGRST205") {
      return {
        connected: true,
        url: SUPABASE_URL,
        message: `Supabase connected successfully (${latency}ms). Project: ${SUPABASE_URL}`,
      };
    }

    return {
      connected: false,
      url: SUPABASE_URL,
      message: `Connection returned: ${error.message} (Code: ${error.code})`,
    };
  } catch (err: any) {
    return {
      connected: false,
      url: SUPABASE_URL,
      message: `Connection failed: ${err?.message || "Network error"}`,
    };
  }
}

// Admin Authorization check
export function isAuthorizedAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase();
}
