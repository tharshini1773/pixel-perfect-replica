import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { CheckCircle2, Eye, EyeOff, Lock, ShieldAlert, Sparkles, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/site/Logo";
import { Button } from "@/components/ui/button";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/admin/reset-password")({
  head: () => ({
    meta: pageMeta(
      "Reset Password — Sweet Crumbs Bakery Admin",
      "Configure a new password for your administrative account.",
    ),
  }),
  component: AdminResetPasswordPage,
});

function AdminResetPasswordPage() {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password || password.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please ensure both fields are identical.");
      return;
    }

    setLoading(true);
    const result = await resetPassword(password);
    setLoading(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate({ to: "/admin/login" });
      }, 2500);
    } else {
      setError(result.error || "Failed to update password. Your recovery link may be expired.");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAF7F2] px-4 py-12 text-[#1A100C]">
      <div className="fixed -top-40 -right-40 h-96 w-96 rounded-full bg-rose/10 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        <div className="overflow-hidden rounded-3xl border border-[#EFE4DB] bg-white p-8 shadow-card sm:p-10">
          <div className="flex flex-col items-center text-center">
            <Link to="/" className="mb-6 inline-block transition-transform duration-300 hover:scale-105">
              <Logo />
            </Link>
            <h1 className="font-display text-2xl font-bold tracking-tight text-[#1A100C] sm:text-3xl">
              Set New Password
            </h1>
            <p className="mt-1.5 text-xs text-[#6B5E57] max-w-xs leading-relaxed">
              Create a strong new password for your administrator account.
            </p>
          </div>

          {error && (
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-rose/30 bg-rose/10 p-4 text-xs font-medium text-[#8F1D35]">
              <ShieldAlert className="h-4 w-4 shrink-0 text-rose mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {success ? (
            <div className="mt-8 space-y-6 text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-[#1A100C]">Password Updated Successfully!</h3>
                <p className="mt-2 text-xs text-[#6B5E57] leading-relaxed">
                  Your new credentials are now active. Redirecting you to the Admin Login portal…
                </p>
              </div>
              <Button asChild variant="rose" className="w-full">
                <Link to="/admin/login">
                  <span>Sign In Now</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
              <div>
                <label htmlFor="new-pass" className="block text-xs font-bold uppercase tracking-wider text-[#5C4D44] mb-1.5">
                  New Password (min 8 characters)
                </label>
                <div className="relative">
                  <input
                    id="new-pass"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
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

              <div>
                <label htmlFor="confirm-pass" className="block text-xs font-bold uppercase tracking-wider text-[#5C4D44] mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    id="confirm-pass"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-xl border border-[#EFE4DB] bg-[#FAF7F2] pl-10 pr-4 py-3 text-sm text-[#1A100C] placeholder:text-[#A8988E] transition-all focus:border-rose focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose/20"
                  />
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-[#8C7A70]" />
                </div>
              </div>

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
                    <span>Updating Password…</span>
                  </>
                ) : (
                  <span>Update Password</span>
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

