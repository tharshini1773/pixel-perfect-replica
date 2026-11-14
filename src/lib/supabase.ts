import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith("http") &&
    !supabaseUrl.includes("placeholder"),
);

// Fallback dummy credentials to allow offline initialization without runtime exceptions
const fallbackUrl = "https://mock-cake-bakery.supabase.co";
const fallbackAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.dummyKey";

export const supabase: SupabaseClient = createClient(
  supabaseUrl && supabaseUrl.startsWith("http") ? supabaseUrl : fallbackUrl,
  supabaseAnonKey || fallbackAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: "sweet_crumbs_auth_session",
    },
  },
);

export type UserRole = "admin" | "staff" | "customer";

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  role?: UserRole;
  created_at?: string;
}

