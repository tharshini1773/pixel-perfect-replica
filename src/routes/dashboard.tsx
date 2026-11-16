import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { pageMeta } from "@/lib/seo";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: pageMeta(
      "Admin Dashboard — Sweet Crumbs Bakery",
      "Administrative bakery management dashboard.",
    ),
  }),
  component: DashboardRouteComponent,
});

function DashboardRouteComponent() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (user && isAdmin) {
        navigate({ to: "/admin/dashboard", replace: true });
      } else {
        navigate({ to: "/admin/login", replace: true });
      }
    }
  }, [user, isAdmin, loading, navigate]);

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
          <h2 className="font-display text-xl font-bold text-[#1A100C]">Authenticating Admin Session</h2>
          <p className="text-xs text-[#6B5E57] mt-1">Verifying Firebase administrator credentials…</p>
        </div>
      </div>
    </div>
  );
}
