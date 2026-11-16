import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  ShieldCheck,
  LogOut,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Lock,
  UserCheck,
  Server,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/site/Logo";
import { Button } from "@/components/ui/button";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({
    meta: pageMeta(
      "Admin Dashboard — Sweet Crumbs Bakery",
      "Authorized administrative dashboard for Sweet Crumbs Bakery.",
    ),
  }),
  component: AdminDashboardLanding,
});

function AdminDashboardLanding() {
  const { user, isAdmin, loading, logout } = useAuth();
  const navigate = useNavigate();

  // Route Protection: If unauthorized, redirect to /admin/login
  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate({ to: "/admin/login" });
    }
  }, [user, isAdmin, loading, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/admin/login" });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF7F2]">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative h-14 w-14">
            <div className="absolute inset-0 rounded-2xl bg-rose/20 animate-ping" />
            <div className="relative grid h-14 w-14 place-items-center rounded-2xl bg-rose text-white shadow-soft">
              <Sparkles className="h-7 w-7 animate-spin" />
            </div>
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-[#1A100C]">Verifying Authentication</h2>
            <p className="text-xs text-[#6B5E57] mt-1">Checking administrator privileges with Firebase…</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF7F2]">
        <div className="text-center">
          <p className="text-sm font-semibold text-rose">Redirecting to login…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1A100C]">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-[#EFE4DB] bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link to="/" className="transition-transform hover:scale-105">
              <Logo />
            </Link>
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-rose/20 bg-rose/10 px-3 py-1 text-xs font-bold text-rose">
              <ShieldCheck className="h-4 w-4" />
              <span>Admin Portal</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="hidden sm:inline-flex gap-1.5 border-[#EFE4DB] text-xs font-semibold hover:bg-cream"
            >
              <Link to="/" target="_blank">
                <span>View Customer Website</span>
                <ExternalLink className="h-3.5 w-3.5 text-[#8C7A70]" />
              </Link>
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="gap-1.5 border-rose/30 text-xs font-bold text-rose hover:bg-rose/10"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Verification Success Hero Card */}
        <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-white p-8 shadow-card sm:p-10">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-emerald-50 blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3.5 py-1 text-xs font-bold text-emerald-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Phase 2 Complete — Firebase Login Verification Successful</span>
              </div>
              <h1 className="font-display text-3xl font-bold tracking-tight text-[#1A100C] sm:text-4xl">
                Welcome to Admin Dashboard
              </h1>
              <p className="text-sm text-[#6B5E57] max-w-2xl leading-relaxed">
                Your administrator identity has been authenticated via Firebase Authentication. Protected route{" "}
                <code className="rounded bg-[#FAF7F2] px-1.5 py-0.5 text-rose font-mono text-xs">/admin/dashboard</code> is unlocked.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-[#EFE4DB] bg-[#FAF7F2] p-4">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-rose text-white shadow-soft">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[0.7rem] font-bold uppercase tracking-wider text-[#8C7A70]">Administrator</p>
                <p className="text-xs font-bold text-[#1A100C]">{user.fullName}</p>
                <p className="text-[0.72rem] text-rose font-mono">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Verification Details Grid */}
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-[#EFE4DB] bg-[#FAF7F2] p-5">
              <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-[#5C4D44]">
                <UserCheck className="h-4 w-4 text-emerald-600" />
                <span>Admin Identity</span>
              </div>
              <p className="mt-2 text-sm font-bold text-[#1A100C]">{user.email}</p>
              <p className="mt-1 text-xs text-[#8C7A70]">Verified bakery owner email</p>
            </div>

            <div className="rounded-2xl border border-[#EFE4DB] bg-[#FAF7F2] p-5">
              <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-[#5C4D44]">
                <Server className="h-4 w-4 text-rose" />
                <span>Authentication Provider</span>
              </div>
              <p className="mt-2 text-sm font-bold text-[#1A100C]">Firebase Auth</p>
              <p className="mt-1 text-xs text-[#8C7A70]">Project: tharshini-website</p>
            </div>

            <div className="rounded-2xl border border-[#EFE4DB] bg-[#FAF7F2] p-5">
              <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-[#5C4D44]">
                <Lock className="h-4 w-4 text-amber-600" />
                <span>Route Protection</span>
              </div>
              <p className="mt-2 text-sm font-bold text-[#1A100C]">Active & Enforced</p>
              <p className="mt-1 text-xs text-[#8C7A70]">Redirects unauthenticated visitors</p>
            </div>
          </div>

          {/* Next Steps Card */}
          <div className="mt-8 rounded-2xl border border-dashed border-rose/30 bg-rose/5 p-6">
            <div className="flex items-start gap-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-rose/10 text-rose">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-[#1A100C]">
                  Awaiting Instructions for Dashboard Modules
                </h3>
                <p className="mt-1 text-xs text-[#6B5E57] leading-relaxed">
                  As instructed, Phase 1 (Admin Login Page) and Phase 2 (Firebase Authentication Verification) are complete and tested. 
                  Dashboard modules will be developed once you give further instructions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
