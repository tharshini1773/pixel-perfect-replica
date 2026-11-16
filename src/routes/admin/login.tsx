import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { AdminAuthStage } from "@/components/admin/AdminAuthStage";
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
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && isAdmin) {
      navigate({ to: "/admin/dashboard" });
    }
  }, [user, isAdmin, loading, navigate]);

  return (
    <AdminAuthStage
      onSuccess={() => navigate({ to: "/admin/dashboard" })}
      title="Admin Login"
      subtitle="Sign in with your Firebase administrator credentials to proceed to the management dashboard."
    />
  );
}
