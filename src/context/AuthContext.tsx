import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase, isSupabaseConfigured, type Profile, type UserRole } from "@/lib/supabase";

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  phone?: string;
}

interface AuthContextType {
  user: AdminUser | null;
  loading: boolean;
  isAdmin: boolean;
  isConfigured: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; error?: string; previewLink?: string }>;
  resetPassword: (password: string) => Promise<{ success: boolean; error?: string }>;
  updateAdminProfile: (updates: { fullName?: string; phone?: string; email?: string }) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_SESSION_KEY = "sweet_crumbs_admin_session";
const LOCAL_REMEMBER_KEY = "sweet_crumbs_admin_remember";

// Default authorized shop owner admin identity
const DEFAULT_ADMIN: AdminUser = {
  id: "admin-master-tharshini",
  email: "tharshini1773@gmail.com",
  fullName: "Tharshini (Owner & Head Baker)",
  role: "admin",
  phone: "7550362608",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      try {
        if (isSupabaseConfigured) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user && mounted) {
            // Verify admin role in user_roles table
            const { data: roleData } = await supabase
              .from("user_roles")
              .select("role")
              .eq("user_id", session.user.id)
              .single();

            const role = (roleData?.role as UserRole) || "admin";
            setUser({
              id: session.user.id,
              email: session.user.email || "",
              fullName: session.user.user_metadata?.full_name || "Admin",
              role,
              phone: session.user.user_metadata?.phone,
            });
          }
        } else {
          // Check local stored session
          const savedSession = localStorage.getItem(LOCAL_SESSION_KEY) || sessionStorage.getItem(LOCAL_SESSION_KEY);
          if (savedSession) {
            try {
              const parsed = JSON.parse(savedSession);
              if (parsed?.role === "admin") {
                setUser(parsed);
              }
            } catch {
              // ignore invalid stored session
            }
          }
        }
      } catch (err) {
        console.error("Auth check error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    checkAuth();

    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const { data: roleData } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", session.user.id)
            .single();

          const role = (roleData?.role as UserRole) || "admin";
          setUser({
            id: session.user.id,
            email: session.user.email || "",
            fullName: session.user.user_metadata?.full_name || "Admin",
            role,
            phone: session.user.user_metadata?.phone,
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      });

      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    }

    return () => {
      mounted = false;
    };
  }, []);

  const login = async (email: string, password: string, rememberMe = true) => {
    setLoading(true);
    try {
      const trimmedEmail = email.trim().toLowerCase();

      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });

        if (error) {
          setLoading(false);
          return { success: false, error: error.message };
        }

        if (data.user) {
          // Verify admin role
          const { data: roleData } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", data.user.id)
            .single();

          if (roleData?.role !== "admin") {
            await supabase.auth.signOut();
            setLoading(false);
            return {
              success: false,
              error: "Access Denied: This account does not possess administrator privileges.",
            };
          }

          const adminUser: AdminUser = {
            id: data.user.id,
            email: data.user.email || trimmedEmail,
            fullName: data.user.user_metadata?.full_name || "Admin",
            role: "admin",
          };

          setUser(adminUser);
          setLoading(false);
          return { success: true };
        }
      }

      // Hybrid local validation for seamless testing & initial setup
      // Allows owner email or admin demo credentials
      const validAdminEmails = ["tharshini1773@gmail.com", "admin@sweetcrumbs.com", "admin@bakery.com"];
      const isEmailValid = validAdminEmails.includes(trimmedEmail);

      if (!isEmailValid) {
        setLoading(false);
        return {
          success: false,
          error: "Unauthorized email address. Only designated bakery administrators can access this portal.",
        };
      }

      if (password.length < 6) {
        setLoading(false);
        return {
          success: false,
          error: "Invalid password credentials provided. Password must be at least 6 characters.",
        };
      }

      const activeUser: AdminUser = {
        ...DEFAULT_ADMIN,
        email: trimmedEmail,
        fullName: trimmedEmail.includes("tharshini") ? "Tharshini (Owner & Head Baker)" : "Bakery Manager",
      };

      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem(LOCAL_SESSION_KEY, JSON.stringify(activeUser));
      if (rememberMe) {
        localStorage.setItem(LOCAL_REMEMBER_KEY, trimmedEmail);
      } else {
        localStorage.removeItem(LOCAL_REMEMBER_KEY);
      }

      setUser(activeUser);
      setLoading(false);
      return { success: true };
    } catch (err: any) {
      setLoading(false);
      return { success: false, error: err.message || "An unexpected error occurred during login." };
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
      localStorage.removeItem(LOCAL_SESSION_KEY);
      sessionStorage.removeItem(LOCAL_SESSION_KEY);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const requestPasswordReset = async (email: string) => {
    try {
      const trimmedEmail = email.trim().toLowerCase();
      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
          redirectTo: `${window.location.origin}/admin/reset-password`,
        });
        if (error) return { success: false, error: error.message };
        return { success: true };
      }

      // Hybrid preview link for local development/testing
      const previewLink = `/admin/reset-password?email=${encodeURIComponent(trimmedEmail)}&token=simulated-reset-token-${Date.now()}`;
      return { success: true, previewLink };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to dispatch password recovery email." };
    }
  };

  const resetPassword = async (password: string) => {
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) return { success: false, error: error.message };
        return { success: true };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to update password." };
    }
  };

  const updateAdminProfile = async (updates: { fullName?: string; phone?: string; email?: string }) => {
    try {
      if (!user) return { success: false, error: "Not authenticated" };

      const updatedUser: AdminUser = {
        ...user,
        fullName: updates.fullName || user.fullName,
        phone: updates.phone || user.phone,
        email: updates.email || user.email,
      };

      if (isSupabaseConfigured) {
        await supabase.auth.updateUser({
          data: {
            full_name: updatedUser.fullName,
            phone: updatedUser.phone,
          },
        });
      }

      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to update profile." };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin: user?.role === "admin",
        isConfigured: isSupabaseConfigured,
        login,
        logout,
        requestPasswordReset,
        resetPassword,
        updateAdminProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

