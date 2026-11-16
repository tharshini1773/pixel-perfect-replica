import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useEffect } from "react";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/admin/")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/login" });
  },
  head: () => ({
    meta: pageMeta(
      "Admin Login — Sweet Crumbs Bakery",
      "Administrative authentication portal for Sweet Crumbs Bakery.",
    ),
  }),
  component: AdminIndexRedirect,
});

function AdminIndexRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate({ to: "/admin/login", replace: true });
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAF7F2]">
      <p className="text-xs text-[#8C7A70]">Redirecting to admin login…</p>
    </div>
  );
}
