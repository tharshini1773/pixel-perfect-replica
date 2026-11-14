import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Eye, EyeOff, Lock, Mail, ShieldAlert, Sparkles, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/site/Logo";
import { Button } from "@/components/ui/button";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: pageMeta(
      "Admin Login — Sweet Crumbs Bakery",
      "Secure administrative authentication portal for Sweet Crumbs Bakery.",
    ),
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("tharshini1773@gmail.com");
  const [password, setPassword] = useState("BakeryAdmin2026!");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already authenticated as admin, allow immediate jump to dashboard
  if (user && user.role === "admin") {
    navigate({ to: "/admin" });
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !email.includes("@")) {
      setError("Please provide a valid administrative email address.");
      return;
    }

    if (!password || password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    setLoading(true);
    const result = await login(email, password, rememberMe);
    setLoading(false);

    if (result.success) {
      navigate({ to: "/admin" });
    } else {
      setError(result.error || "Failed to authenticate. Please check your credentials.");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAF7F2] px-4 py-12 text-[#1A100C]">
      {/* Background Accent Gradients */}
      <div className="fixed -top-40 -right-40 h-96 w-96 rounded-full bg-rose/10 blur-3xl pointer-events-none" />
      <div className="fixed -bottom-40 -left-40 h-96 w-96 rounded-full bg-[#E8927C]/10 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Brand Card */}
        <div className="overflow-hidden rounded-3xl border border-[#EFE4DB] bg-white p-8 shadow-card sm:p-10">
          {/* Header & Logo */}
          <div className="flex flex-col items-center text-center">
            <Link to="/" className="mb-6 inline-block transition-transform duration-300 hover:scale-105">
              <Logo />
            </Link>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-rose/10 px-3 py-1 text-xs font-bold text-rose">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Admin Management Portal</span>
            </div>
            <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-[#1A100C] sm:text-3xl">
              Welcome Back
            </h1>
            <p className="mt-1.5 text-xs text-[#6B5E57] max-w-xs leading-relaxed">
              Sign in to manage your cake inventory, orders, customer details, and promotional campaigns.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-rose/30 bg-rose/10 p-4 text-xs font-medium text-[#8F1D35]">
              <ShieldAlert className="h-4 w-4 shrink-0 text-rose mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            {/* Email Address */}
            <div>
              <label htmlFor="admin-email" className="block text-xs font-bold uppercase tracking-wider text-[#5C4D44] mb-1.5">
                Admin Email Address
              </label>
              <div className="relative">
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@sweetcrumbs.com"
                  className="w-full rounded-xl border border-[#EFE4DB] bg-[#FAF7F2] pl-10 pr-4 py-3 text-sm text-[#1A100C] placeholder:text-[#A8988E] transition-all focus:border-rose focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose/20"
                />
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-[#8C7A70]" />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="admin-pass" className="block text-xs font-bold uppercase tracking-wider text-[#5C4D44]">
                  Password
                </label>
                <Link
                  to="/admin/forgot-password"
                  className="text-xs font-semibold text-rose hover:text-rose-dark transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="admin-pass"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-[#EFE4DB] bg-[#FAF7F2] pl-10 pr-11 py-3 text-sm text-[#1A100C] placeholder:text-[#A8988E] transition-all focus:border-rose focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose/20"
                />
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-[#8C7A70]" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-[#8C7A70] hover:text-[#1A100C] transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs font-medium text-[#5C4D44] cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-[#EFE4DB] text-rose accent-rose focus:ring-rose"
                />
                <span>Remember this workstation</span>
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              size="lg"
              variant="rose"
              className="w-full font-bold shadow-soft shadow-rose/20 mt-2"
            >
              {loading ? (
                <>
                  <Sparkles className="h-4 w-4 animate-spin" />
                  <span>Verifying Credentials…</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Quick Demo Helper Pill */}
          <div className="mt-8 rounded-2xl border border-dashed border-[#EFE4DB] bg-[#FAF7F2] p-4 text-center">
            <p className="text-[0.7rem] font-bold uppercase tracking-wider text-[#8C7A70]">
              Authorized Demo Credentials
            </p>
            <p className="mt-1 text-xs text-[#5C4D44]">
              <strong>Email:</strong> <code className="text-rose font-mono">tharshini1773@gmail.com</code>
            </p>
            <p className="mt-0.5 text-xs text-[#5C4D44]">
              <strong>Password:</strong> <code className="text-rose font-mono">BakeryAdmin2026!</code>
            </p>
          </div>

          <div className="mt-6 text-center">
            <Link
              to="/"
              className="text-xs font-semibold text-[#8C7A70] hover:text-rose transition-colors"
            >
              ← Back to Customer Website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

