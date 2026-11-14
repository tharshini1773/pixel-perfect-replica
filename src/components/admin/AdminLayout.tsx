import { type ReactNode, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Cake,
  ShoppingBag,
  Users,
  FolderTree,
  Tag,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Store,
  ChevronRight,
  ShieldCheck,
  Bell,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useBakeryStore } from "@/context/BakeryStoreContext";
import { Logo } from "@/components/site/Logo";
import { Button } from "@/components/ui/button";
import { AdminAuthStage } from "./AdminAuthStage";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function AdminLayout({ children, title, subtitle, action }: AdminLayoutProps) {
  const { user, isAdmin, loading, logout } = useAuth();
  const { orders } = useBakeryStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const pendingOrdersCount = orders.filter((o) => o.status === "pending").length;

  const navItems = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { to: "/admin/products", label: "Products", icon: Cake },
    {
      to: "/admin/orders",
      label: "Orders",
      icon: ShoppingBag,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
    },
    { to: "/admin/customers", label: "Customers", icon: Users },
    { to: "/admin/categories", label: "Categories", icon: FolderTree },
    { to: "/admin/offers", label: "Offers & Discounts", icon: Tag },
    { to: "/admin/settings", label: "Settings", icon: Settings },
  ];

  const handleLogout = async () => {
    await logout();
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
            <h2 className="font-display text-xl font-bold text-[#1A100C]">Authenticating Admin</h2>
            <p className="text-xs text-[#6B5E57] mt-1">Verifying administrator privileges & secure session…</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <AdminAuthStage
        title="Admin Authentication"
        subtitle="Please enter your administrator login and password to access the bakery management dashboard."
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-[#FAF7F2] text-[#1A100C]">
      {/* Desktop Sidebar */}
      <aside className="hidden w-72 flex-col border-r border-[#EFE4DB] bg-white shadow-sm lg:flex">
        {/* Brand Lockup */}
        <div className="flex h-20 items-center justify-between border-b border-[#EFE4DB] px-6">
          <Link to="/admin" className="flex items-center gap-3">
            <Logo />
          </Link>
        </div>

        {/* Admin Tag */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between rounded-2xl border border-rose/20 bg-rose/5 px-3.5 py-2.5">
            <div className="flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-rose text-white">
                <ShieldCheck className="h-3.5 w-3.5" />
              </span>
              <div>
                <p className="text-xs font-bold text-rose">Bakery Admin Portal</p>
                <p className="text-[0.65rem] text-[#8C7A70]">{user.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1.5 px-4 py-2">
          {navItems.map((item) => {
            const isActive = item.exact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-rose text-white shadow-soft shadow-rose/20"
                    : "text-[#5C4D44] hover:bg-[#FAF5F0] hover:text-rose"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`h-4 w-4 ${isActive ? "text-white" : "text-[#8C7A70]"}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[0.65rem] font-bold ${
                      isActive ? "bg-white text-rose" : "bg-rose text-white"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-[#EFE4DB] p-4 space-y-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-xl border border-[#EFE4DB] bg-[#FAF7F2] px-4 py-2.5 text-xs font-semibold text-[#5C4D44] transition-colors hover:border-rose/40 hover:text-rose"
          >
            <div className="flex items-center gap-2">
              <Store className="h-3.5 w-3.5" />
              <span>Customer Website</span>
            </div>
            <ExternalLink className="h-3 w-3 text-[#8C7A70]" />
          </a>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-semibold text-rose transition-colors hover:bg-rose/10"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-[#EFE4DB] px-6">
          <Logo />
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-1 text-[#8C7A70] hover:bg-[#FAF5F0]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-4">
          {navItems.map((item) => {
            const isActive = item.exact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);

            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold ${
                  isActive ? "bg-rose text-white shadow-soft" : "text-[#5C4D44] hover:bg-[#FAF5F0]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="rounded-full bg-rose px-2 py-0.5 text-[0.65rem] text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-[#EFE4DB] p-4">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 text-rose"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-[#EFE4DB] bg-white/95 px-6 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-xl border border-[#EFE4DB] p-2 text-[#5C4D44] hover:bg-[#FAF7F2] lg:hidden"
              aria-label="Open sidebar menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#8C7A70]">
                <span>Admin</span>
                <ChevronRight className="h-3 w-3" />
                <span className="text-rose font-bold">{title}</span>
              </div>
              <h1 className="font-display text-xl font-bold text-[#1A100C] sm:text-2xl mt-0.5">
                {title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {action}

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-[#EFE4DB] bg-[#FAF7F2] px-3.5 py-1.5 text-xs font-bold text-[#5C4D44] transition-colors hover:border-rose/40 hover:text-rose"
            >
              <Store className="h-3.5 w-3.5 text-rose" />
              <span>View Live Store</span>
              <ExternalLink className="h-3 w-3" />
            </a>

            <div className="h-8 w-px bg-[#EFE4DB] hidden sm:block" />

            <div className="flex items-center gap-2">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-rose to-rose-dark font-display font-bold text-white shadow-sm text-sm">
                {user.fullName.slice(0, 1).toUpperCase()}
              </div>
              <div className="hidden text-left md:block">
                <p className="text-xs font-bold text-[#1A100C] leading-none">{user.fullName}</p>
                <p className="text-[0.65rem] text-rose font-medium mt-1">Super Administrator</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {subtitle && (
            <p className="mb-6 -mt-2 text-sm text-[#6B5E57]">{subtitle}</p>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}

