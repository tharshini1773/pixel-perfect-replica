import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
  const navigate = useNavigate();

  return (
    <AdminAuthStage
      onSuccess={() => navigate({ to: "/admin/dashboard" })}
      title="Admin Login"
      subtitle="Sign in with your Firebase administrator credentials to proceed to the management dashboard."
    />
  );
}
