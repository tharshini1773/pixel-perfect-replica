import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: pageMeta(
      "Admin — Sweet Crumbs Bakery",
      "Administrative portal for Sweet Crumbs Bakery.",
    ),
  }),
  component: AdminIndexRedirect,
});

function AdminIndexRedirect() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (user && isAdmin) {
        navigate({ to: "/admin/dashboard" });
      } else {
        navigate({ to: "/admin/login" });
      }
    }
  }, [user, isAdmin, loading, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAF7F2]">
      <p className="text-xs text-[#8C7A70]">Redirecting to admin portal…</p>
    </div>
  );
}
