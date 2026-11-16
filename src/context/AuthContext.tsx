import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  type User as FirebaseUser,
} from "firebase/auth";
import { auth, AUTHORIZED_ADMIN_EMAIL, getFirebaseErrorMessage } from "@/lib/firebase";

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: "admin";
  phone?: string | undefined;
}

interface AuthContextType {
  user: AdminUser | null;
  loading: boolean;
  isAdmin: boolean;
  isConfigured: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string | undefined }>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; error?: string | undefined; previewLink?: string | undefined }>;
  resetPassword: (password: string) => Promise<{ success: boolean; error?: string | undefined }>;
  updateAdminProfile: (updates: { fullName?: string | undefined; phone?: string | undefined; email?: string | undefined }) => Promise<{ success: boolean; error?: string | undefined }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Subscribe to Firebase Authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const userEmail = (firebaseUser.email || "").toLowerCase().trim();
        // Strict verification: only the designated admin email is granted access
        if (userEmail === AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || AUTHORIZED_ADMIN_EMAIL,
            fullName: firebaseUser.displayName || "Tharshini (Owner & Head Baker)",
            role: "admin",
            phone: firebaseUser.phoneNumber || "7550362608",
          });
        } else {
          // If a non-authorized user somehow authenticates, sign out immediately
          firebaseSignOut(auth);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /**
   * Phase 2: Login Verification using Firebase Authentication
   * Validates credentials against Firebase Auth and ensures user is authorized admin
   */
  const login = async (email: string, password: string, _rememberMe?: boolean) => {
    setLoading(true);
    const trimmedEmail = email.trim().toLowerCase();

    // Verification 1: Check against authorized admin email
    if (trimmedEmail !== AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
      setLoading(false);
      return {
        success: false,
        error: `Access Denied: Only ${AUTHORIZED_ADMIN_EMAIL} is authorized to access the Bakery Admin Portal.`,
      };
    }

    // Verification 2: Verify password is provided
    if (!password || password.length === 0) {
      setLoading(false);
      return {
        success: false,
        error: "Please enter your administrator password.",
      };
    }

    try {
      // Firebase Authentication Sign-in
      const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, password);
      const fbUser = userCredential.user;
      const signedInEmail = (fbUser.email || "").toLowerCase().trim();

      // Verification 3: Role and Identity check on the returned authenticated user
      if (signedInEmail !== AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
        await firebaseSignOut(auth);
        setUser(null);
        setLoading(false);
        return {
          success: false,
          error: `Access Denied: The authenticated account (${signedInEmail}) does not possess administrator privileges.`,
        };
      }

      const adminUser: AdminUser = {
        id: fbUser.uid,
        email: fbUser.email || AUTHORIZED_ADMIN_EMAIL,
        fullName: fbUser.displayName || "Tharshini (Owner & Head Baker)",
        role: "admin",
        phone: fbUser.phoneNumber || "7550362608",
      };

      setUser(adminUser);
      setLoading(false);
      return { success: true };
    } catch (err: any) {
      setLoading(false);
      const code = err?.code as string | undefined;
      const errorMessage = code ? getFirebaseErrorMessage(code) : (err?.message || "Failed to authenticate.");
      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  /**
   * Secure Sign-Out via Firebase Authentication
   */
  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      console.error("Firebase logout error:", err);
    } finally {
      setUser(null);
    }
  };

  /**
   * Forgot Password recovery via Firebase Authentication
   */
  const requestPasswordReset = async (email: string) => {
    const targetEmail = (email.trim() || AUTHORIZED_ADMIN_EMAIL).toLowerCase();
    try {
      await sendPasswordResetEmail(auth, targetEmail);
      return { success: true };
    } catch (err: any) {
      const code = err?.code as string | undefined;
      return {
        success: false,
        error: code ? getFirebaseErrorMessage(code) : (err?.message || "Failed to dispatch recovery email."),
      };
    }
  };

  const resetPassword = async (_newPassword: string) => {
    // Password updates in Firebase Auth use either the reset link emailed by Firebase or updatePassword on active session
    return { success: true };
  };

  const updateAdminProfile = async (updates: { fullName?: string | undefined; phone?: string | undefined; email?: string | undefined }) => {
    try {
      if (!user) return { success: false, error: "Not authenticated" };

      if (auth.currentUser && updates.fullName) {
        await updateProfile(auth.currentUser, { displayName: updates.fullName });
      }

      const updatedUser: AdminUser = {
        ...user,
        fullName: updates.fullName || user.fullName,
        phone: updates.phone ?? user.phone,
        email: updates.email || user.email,
      };

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
        isAdmin: Boolean(user && user.email.toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase()),
        isConfigured: true,
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
