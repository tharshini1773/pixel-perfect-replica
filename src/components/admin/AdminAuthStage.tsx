import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/site/Logo";
import { Button } from "@/components/ui/button";

interface AdminAuthStageProps {
  onSuccess?: () => void;
  title?: string;
  subtitle?: string;
}

export function AdminAuthStage({
  onSuccess,
  title = "Admin Login",
  subtitle = "Sign in with your Firebase administrator credentials to access the bakery management dashboard.",
}: AdminAuthStageProps) {
  const { login, requestPasswordReset } = useAuth();

  const [email, setEmail] = useState("tharshini1773@gmail.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [sendingReset, setSendingReset] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setResetMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setError("Please provide a valid administrative email address.");
      return;
    }

    if (!password) {
      setError("Please enter your administrator password.");
      return;
    }

    if (password !== "BakeryAdmin2026") {
      setError("Invalid admin password.");
      return;
    }

    setLoading(true);
    const result = await login(trimmedEmail, password, rememberMe);
    setLoading(false);

    if (result.success) {
      if (onSuccess) {
        onSuccess();
      }
    } else {
      setError(result.error || "Authentication failed. Please check your credentials.");
    }
  };

  const handleForgotPassword = async () => {
    setError(null);
    setResetMessage(null);
    const targetEmail = email.trim() || "tharshini1773@gmail.com";

    setSendingReset(true);
    const res = await requestPasswordReset(targetEmail);
    setSendingReset(false);

    if (res.success) {
      setResetMessage(`Password recovery link dispatched to ${targetEmail}. Please check your inbox.`);
    } else {
      setError(res.error || "Unable to send password recovery email. Please check Firebase configuration.");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAF7F2] px-4 py-12 text-[#1A100C]">
      {/* Background Accent Gradients */}
      <div className="fixed -top-40 -right-40 h-96 w-96 rounded-full bg-rose/10 blur-3xl pointer-events-none" />
      <div className="fixed -bottom-40 -left-40 h-96 w-96 rounded-full bg-[#E8927C]/10 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        <div className="overflow-hidden rounded-3xl border border-[#EFE4DB] bg-white p-8 shadow-card sm:p-10">
          {/* Header & Logo */}
          <div className="flex flex-col items-center text-center">
            <Link to="/" className="mb-6 inline-block transition-transform duration-300 hover:scale-105">
              <Logo />
            </Link>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-rose/10 px-3 py-1 text-xs font-bold text-rose">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Firebase Authentication</span>
            </div>
            <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-[#1A100C] sm:text-3xl">
              {title}
            </h1>
            <p className="mt-1.5 text-xs text-[#6B5E57] max-w-xs leading-relaxed">
              {subtitle}
            </p>
          </div>

          {/* Success / Recovery Message */}
          {resetMessage && (
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-50 p-4 text-xs font-medium text-emerald-800">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
              <p>{resetMessage}</p>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-rose/30 bg-rose/10 p-4 text-xs font-medium text-[#8F1D35]">
              <ShieldAlert className="h-4 w-4 shrink-0 text-rose mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">Authentication Error</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            {/* Email Address */}
            <div>
              <label
                htmlFor="auth-stage-email"
                className="block text-xs font-bold uppercase tracking-wider text-[#5C4D44] mb-1.5"
              >
                Admin Email Address
              </label>
              <div className="relative">
                <input
                  id="auth-stage-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tharshini1773@gmail.com"
                  className="w-full rounded-xl border border-[#EFE4DB] bg-[#FAF7F2] pl-10 pr-4 py-3 text-sm text-[#1A100C] placeholder:text-[#A8988E] transition-all focus:border-rose focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose/20"
                />
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-[#8C7A70]" />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="auth-stage-pass"
                  className="block text-xs font-bold uppercase tracking-wider text-[#5C4D44]"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={sendingReset}
                  className="text-xs font-semibold text-rose hover:text-rose-dark transition-colors disabled:opacity-50"
                >
                  {sendingReset ? "Sending reset email…" : "Forgot Password?"}
                </button>
              </div>
              <div className="relative">
                <input
                  id="auth-stage-pass"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your administrator password"
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
              className="w-full font-bold shadow-soft shadow-rose/20 mt-2 bg-none bg-[#C23854] hover:bg-[#B32E4A] active:bg-[#D96B84] active:opacity-85 text-white transition-all"
            >
              {loading ? (
                <>
                  <Sparkles className="h-4 w-4 animate-spin" />
                  <span>Verifying Credentials with Firebase…</span>
                </>
              ) : (
                <>
                  <span>Login to Admin Portal</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Secure Admin Note */}
          <div className="mt-8 rounded-2xl border border-dashed border-[#EFE4DB] bg-[#FAF7F2] p-4 text-center">
            <p className="text-[0.7rem] font-bold uppercase tracking-wider text-[#8C7A70]">
              Authorized Bakery Admin Email
            </p>
            <p className="mt-1 text-xs text-[#5C4D44]">
              <code className="text-rose font-mono font-bold">tharshini1773@gmail.com</code>
            </p>
            <p className="mt-1 text-[0.72rem] text-[#8C7A70]">
              Protected via Firebase Authentication. Public registration is disabled.
            </p>
          </div>

          <div className="mt-6 text-center">
            <Link
              to="/"
              className="text-xs font-semibold text-[#8C7A70] hover:text-rose transition-colors"
            >
              ← Return to Customer Website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
