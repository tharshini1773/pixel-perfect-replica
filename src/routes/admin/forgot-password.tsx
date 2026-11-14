import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowLeft, CheckCircle2, Mail, ShieldAlert, Sparkles, ExternalLink } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/site/Logo";
import { Button } from "@/components/ui/button";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/admin/forgot-password")({
  head: () => ({
    meta: pageMeta(
      "Forgot Password — Sweet Crumbs Bakery Admin",
      "Reset your administrative password securely for Sweet Crumbs Bakery.",
    ),
  }),
  component: AdminForgotPasswordPage,
});

function AdminForgotPasswordPage() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState("tharshini1773@gmail.com");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [previewLink, setPreviewLink] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !email.includes("@")) {
      setError("Please provide a valid administrative email address.");
      return;
    }

    setLoading(true);
    const result = await requestPasswordReset(email);
    setLoading(false);

    if (result.success) {
      setSubmitted(true);
      if (result.previewLink) {
        setPreviewLink(result.previewLink);
      }
    } else {
      setError(result.error || "Unable to dispatch recovery instructions.");
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
              Password Recovery
            </h1>
            <p className="mt-1.5 text-xs text-[#6B5E57] max-w-xs leading-relaxed">
              Enter the email address registered with your administrator account and we will send you a secure password reset link.
            </p>
          </div>

          {error && (
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-rose/30 bg-rose/10 p-4 text-xs font-medium text-[#8F1D35]">
              <ShieldAlert className="h-4 w-4 shrink-0 text-rose mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {submitted ? (
            <div className="mt-8 space-y-6 text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <div>
                <h3 className="font-display text-lg font-bold text-[#1A100C]">Recovery Link Dispatched</h3>
                <p className="mt-2 text-xs text-[#6B5E57] leading-relaxed">
                  We have dispatched secure password reset instructions to{" "}
                  <strong className="text-[#1A100C]">{email}</strong>. Please check your inbox and click the link to configure a new password.
                </p>
              </div>

              {previewLink && (
                <div className="rounded-2xl border border-rose/20 bg-rose/5 p-4 text-left">
                  <p className="text-[0.7rem] font-bold uppercase tracking-wider text-rose">
                    Simulated Development Link
                  </p>
                  <p className="mt-1 text-xs text-[#5C4D44]">
                    For immediate testing without waiting for an SMTP relay:
                  </p>
                  <Link
                    to={previewLink}
                    className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-rose hover:underline"
                  >
                    <span>Proceed to Reset Password Page</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              )}

              <div className="pt-2">
                <Button asChild variant="outline" className="w-full">
                  <Link to="/admin/login">
                    <ArrowLeft className="h-4 w-4" /> Back to Admin Login
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
              <div>
                <label htmlFor="recovery-email" className="block text-xs font-bold uppercase tracking-wider text-[#5C4D44] mb-1.5">
                  Registered Admin Email
                </label>
                <div className="relative">
                  <input
                    id="recovery-email"
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
                    <span>Sending Recovery Instructions…</span>
                  </>
                ) : (
                  <span>Send Recovery Email</span>
                )}
              </Button>

              <div className="pt-2 text-center">
                <Link
                  to="/admin/login"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#8C7A70] hover:text-rose transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to Admin Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

