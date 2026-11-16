import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  Cake,
  FolderTree,
  Users,
  Boxes,
  CreditCard,
  Tag,
  MessageSquareQuote,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Database,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useBakeryStore } from "@/context/BakeryStoreContext";
import { Logo } from "@/components/site/Logo";
import { Button } from "@/components/ui/button";
import { pageMeta } from "@/lib/seo";

// Dashboard Tab Components
import { DashboardOverviewTab } from "@/components/admin/dashboard/DashboardOverviewTab";
import { OrdersTab } from "@/components/admin/dashboard/OrdersTab";
import { ProductsTab } from "@/components/admin/dashboard/ProductsTab";
import { CategoriesTab } from "@/components/admin/dashboard/CategoriesTab";
import { CustomersTab } from "@/components/admin/dashboard/CustomersTab";
import { InventoryTab } from "@/components/admin/dashboard/InventoryTab";
import { PaymentsTab } from "@/components/admin/dashboard/PaymentsTab";
import { OffersTab } from "@/components/admin/dashboard/OffersTab";
import { ReviewsTab } from "@/components/admin/dashboard/ReviewsTab";
import { ReportsTab } from "@/components/admin/dashboard/ReportsTab";
import { NotificationsTab } from "@/components/admin/dashboard/NotificationsTab";
import { SettingsTab } from "@/components/admin/dashboard/SettingsTab";

export const Route = createFileRoute("/admin/dashboard")({
  validateSearch: (search: Record<string, unknown>): { tab?: string } => ({
    tab: (search["tab"] as string) || "dashboard",
  }),
  head: () => ({
    meta: pageMeta(
      "Admin Dashboard — Sweet Crumbs Artisan Bakery",
      "Comprehensive cloud management dashboard for orders, products, inventory, payments, reviews and settings.",
    ),
  }),
  component: AdminDashboardPage,
});

type TabKey =
  | "dashboard"
  | "orders"
  | "products"
  | "categories"
  | "customers"
  | "inventory"
  | "payments"
  | "offers"
  | "reviews"
  | "reports"
  | "notifications"
  | "settings";

interface NavItem {
  key: TabKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | undefined;
  badgeColor?: string | undefined;
}

function AdminDashboardPage() {
  const { user, isAdmin, loading, logout } = useAuth();
  const { orders, inventory, notifications, syncingFirestore } = useBakeryStore();
  const navigate = useNavigate();
  const { tab: initialTab } = Route.useSearch();

  const [activeTab, setActiveTab] = useState<TabKey>((initialTab as TabKey) || "dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sync tab with URL search parameter
  useEffect(() => {
    if (initialTab && initialTab !== activeTab) {
      setActiveTab(initialTab as TabKey);
    }
  }, [initialTab]);

  const switchTab = (tab: string) => {
    setActiveTab(tab as TabKey);
    setMobileMenuOpen(false);
    navigate({ search: { tab } as any });
  };

  // Route Protection: Redirect unauthorized visitors to /admin/login
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
            <h2 className="font-display text-xl font-bold text-[#1A100C]">Authenticating Admin Session</h2>
            <p className="text-xs text-[#6B5E57] mt-1">Verifying Firebase administrator credentials…</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF7F2]">
        <p className="text-xs font-semibold text-rose">Redirecting to administrator login…</p>
      </div>
    );
  }

  const pendingOrdersCount = orders.filter((o) => o.status === "pending" || o.status === "new").length;
  const lowStockCount = inventory.filter((i) => i.quantity <= i.minThreshold).length;
  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  const navItems: NavItem[] = [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "orders", label: "Orders", icon: ShoppingBag, badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined, badgeColor: "bg-rose" },
    { key: "products", label: "Products", icon: Cake },
    { key: "categories", label: "Categories", icon: FolderTree },
    { key: "customers", label: "Customers", icon: Users },
    { key: "inventory", label: "Inventory", icon: Boxes, badge: lowStockCount > 0 ? lowStockCount : undefined, badgeColor: "bg-amber-500" },
    { key: "payments", label: "Payments", icon: CreditCard },
    { key: "offers", label: "Offers & Discounts", icon: Tag },
    { key: "reviews", label: "Reviews", icon: MessageSquareQuote },
    { key: "reports", label: "Reports & Analytics", icon: BarChart3 },
    { key: "notifications", label: "Notifications", icon: Bell, badge: unreadNotifsCount > 0 ? unreadNotifsCount : undefined, badgeColor: "bg-rose" },
    { key: "settings", label: "Shop Settings", icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-[#FAF7F2] text-[#1A100C]">
      {/* Desktop Modern Sidebar */}
      <aside className="hidden w-72 flex-col border-r border-[#EFE4DB] bg-white shadow-sm lg:flex shrink-0">
        {/* Brand Header */}
        <div className="flex h-20 items-center justify-between border-b border-[#EFE4DB] px-6">
          <Link to="/" className="flex items-center gap-3">
            <Logo />
          </Link>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto p-4 scrollbar-thin">
          <p className="px-3 pb-2 text-[0.68rem] font-bold uppercase tracking-wider text-[#8C7A70]">
            Bakery Management
          </p>

          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => switchTab(item.key as TabKey)}
                className={`group flex w-full items-center justify-between rounded-2xl px-3.5 py-2.5 text-xs font-bold transition-all ${
                  active
                    ? "bg-rose text-white shadow-soft shadow-rose/20"
                    : "text-[#5C4D44] hover:bg-[#FAF7F2] hover:text-[#1A100C]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 transition-transform group-hover:scale-110 ${active ? "text-white" : "text-[#8C7A70]"}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[0.65rem] font-bold text-white shadow-sm ${
                      active ? "bg-white/20 text-white" : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="border-t border-[#EFE4DB] p-4 bg-[#FAF7F2]/60">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-rose text-white shadow-soft font-bold text-xs">
              T
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-[#1A100C]">{user.fullName}</p>
              <p className="truncate text-[0.7rem] text-[#8C7A70]">{user.email}</p>
            </div>
          </div>

          <div className="mt-3 flex gap-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="flex-1 text-xs font-semibold gap-1.5 border-[#EFE4DB] hover:bg-white"
            >
              <Link to="/" target="_blank">
                <ExternalLink className="h-3.5 w-3.5 text-[#8C7A70]" />
                <span>Store</span>
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-xs font-bold text-rose hover:bg-rose/10 px-3"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content View */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-[#EFE4DB] bg-white/95 px-4 sm:px-8 backdrop-blur-md">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-xl border border-[#EFE4DB] p-2 text-[#5C4D44] hover:bg-[#FAF7F2] lg:hidden"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <div className="flex items-center gap-2">
              <div className="hidden xs:flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Cloud Firestore</span>
              </div>
              <span className="hidden sm:inline-block text-xs font-semibold text-[#8C7A70]">
                Project: <code className="font-mono text-rose">tharshini-website</code>
              </span>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-3">
            {/* Notifications Shortcut */}
            <button
              onClick={() => switchTab("notifications")}
              className="relative rounded-2xl border border-[#EFE4DB] p-2.5 text-[#5C4D44] hover:bg-[#FAF7F2] transition-colors"
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadNotifsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose text-[0.6rem] font-bold text-white">
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            {/* View Customer Website Button */}
            <Button
              asChild
              variant="outline"
              size="sm"
              className="hidden sm:inline-flex gap-1.5 border-[#EFE4DB] text-xs font-bold hover:bg-cream"
            >
              <Link to="/" target="_blank">
                <span>View Customer Website</span>
                <ExternalLink className="h-3.5 w-3.5 text-[#8C7A70]" />
              </Link>
            </Button>

            {/* Sign Out Button */}
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="gap-1.5 border-rose/30 text-xs font-bold text-rose hover:bg-rose/10 shadow-sm"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden xs:inline">Sign Out</span>
            </Button>
          </div>
        </header>

        {/* Mobile Sidebar Dropdown */}
        {mobileMenuOpen && (
          <div className="border-b border-[#EFE4DB] bg-white p-4 shadow-xl lg:hidden">
            <nav className="grid grid-cols-2 gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => switchTab(item.key as TabKey)}
                    className={`flex items-center justify-between rounded-xl p-2.5 text-xs font-bold ${
                      active ? "bg-rose text-white" : "bg-[#FAF7F2] text-[#5C4D44]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="rounded-full bg-rose text-white px-1.5 py-0.2 text-[0.6rem]">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        )}

        {/* Active Tab View Body */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
          {activeTab === "dashboard" && <DashboardOverviewTab onNavigateTab={switchTab} />}
          {activeTab === "orders" && <OrdersTab />}
          {activeTab === "products" && <ProductsTab />}
          {activeTab === "categories" && <CategoriesTab />}
          {activeTab === "customers" && <CustomersTab />}
          {activeTab === "inventory" && <InventoryTab />}
          {activeTab === "payments" && <PaymentsTab />}
          {activeTab === "offers" && <OffersTab />}
          {activeTab === "reviews" && <ReviewsTab />}
          {activeTab === "reports" && <ReportsTab />}
          {activeTab === "notifications" && <NotificationsTab onNavigateTab={switchTab} />}
          {activeTab === "settings" && <SettingsTab />}
        </main>
      </div>
    </div>
  );
}
