import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ShoppingBag,
  IndianRupee,
  Cake,
  Users,
  Clock,
  TrendingUp,
  ArrowUpRight,
  Sparkles,
  ChevronRight,
  CheckCircle,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useBakeryStore } from "@/context/BakeryStoreContext";
import { formatINR } from "@/config/products";
import { Button } from "@/components/ui/button";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: pageMeta(
      "Admin Dashboard — Sweet Crumbs Bakery",
      "Executive overview, sales analytics, recent orders, and inventory metrics.",
    ),
  }),
  component: AdminDashboardPage,
});

// Sales analytics data (weekly trend)
const salesChartData = [
  { day: "Mon", revenue: 4200, orders: 4 },
  { day: "Tue", revenue: 5800, orders: 6 },
  { day: "Wed", revenue: 3900, orders: 3 },
  { day: "Thu", revenue: 7600, orders: 7 },
  { day: "Fri", revenue: 11200, orders: 11 },
  { day: "Sat", revenue: 16800, orders: 16 },
  { day: "Sun", revenue: 14500, orders: 13 },
];

function AdminDashboardPage() {
  const { products, orders, customers } = useBakeryStore();

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalProducts = products.length;
  const totalCustomers = customers.length;
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const preparingOrders = orders.filter((o) => o.status === "preparing").length;

  const recentOrders = orders.slice(0, 5);
  const bestSellers = products.filter((p) => p.tag === "Bestseller" || p.price >= 800).slice(0, 4);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "confirmed":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "preparing":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "ready":
        return "bg-rose/10 text-rose border-rose/30";
      case "delivered":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "cancelled":
        return "bg-gray-100 text-gray-600 border-gray-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <AdminLayout
      title="Bakery Operations Dashboard"
      subtitle="Real-time sales analytics, pending orders, and menu inventory."
      action={
        <Button asChild size="sm" variant="rose" className="shadow-soft">
          <Link to="/admin/products">
            <Cake className="h-4 w-4" /> Manage Menu
          </Link>
        </Button>
      }
    >
      {/* 1. Overview Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Orders */}
        <div className="flex flex-col justify-between rounded-3xl border border-[#EFE4DB] bg-white p-6 shadow-soft transition-all duration-300 hover:shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8C7A70]">Total Orders</span>
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-rose/10 text-rose">
              <ShoppingBag className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-4">
            <div className="font-display text-3xl font-bold text-[#1A100C]">{totalOrders}</div>
            <p className="mt-1 flex items-center gap-1 text-xs font-medium text-emerald-600">
              <TrendingUp className="h-3.5 w-3.5" /> +18% from last week
            </p>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="flex flex-col justify-between rounded-3xl border border-[#EFE4DB] bg-white p-6 shadow-soft transition-all duration-300 hover:shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8C7A70]">Total Revenue</span>
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
              <IndianRupee className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-4">
            <div className="font-display text-3xl font-bold text-[#1A100C]">{formatINR(totalRevenue)}</div>
            <p className="mt-1 flex items-center gap-1 text-xs font-medium text-emerald-600">
              <TrendingUp className="h-3.5 w-3.5" /> +24% monthly growth
            </p>
          </div>
        </div>

        {/* Pending & Kitchen Orders */}
        <div className="flex flex-col justify-between rounded-3xl border border-[#EFE4DB] bg-white p-6 shadow-soft transition-all duration-300 hover:shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8C7A70]">Action Needed</span>
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-50 text-amber-600">
              <Clock className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-4">
            <div className="font-display text-3xl font-bold text-rose">
              {pendingOrders + preparingOrders}
            </div>
            <p className="mt-1 text-xs font-medium text-[#6B5E57]">
              {pendingOrders} pending confirmation · {preparingOrders} in bakery oven
            </p>
          </div>
        </div>

        {/* Total Menu Products */}
        <div className="flex flex-col justify-between rounded-3xl border border-[#EFE4DB] bg-white p-6 shadow-soft transition-all duration-300 hover:shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8C7A70]">Menu Items</span>
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-rose/10 text-rose">
              <Cake className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-4">
            <div className="font-display text-3xl font-bold text-[#1A100C]">{totalProducts}</div>
            <p className="mt-1 text-xs font-medium text-[#6B5E57]">
              Across 10 artisan cake categories
            </p>
          </div>
        </div>
      </div>

      {/* 2. Charts & Best Sellers Row */}
      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Weekly Revenue Analytics Chart */}
        <div className="overflow-hidden rounded-3xl border border-[#EFE4DB] bg-white p-6 shadow-soft lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-rose">Sales Performance</span>
              <h2 className="font-display text-xl font-bold text-[#1A100C]">Weekly Order Revenue (₹)</h2>
            </div>
            <div className="rounded-full bg-[#FAF7F2] border border-[#EFE4DB] px-3 py-1 text-xs font-bold text-[#5C4D44]">
              Last 7 Days
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E85D75" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#E85D75" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2EAE4" />
                <XAxis dataKey="day" stroke="#8C7A70" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#8C7A70"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip
                  formatter={(value: any) => [`₹${Number(value).toLocaleString("en-IN")}`, "Revenue"]}
                  contentStyle={{
                    backgroundColor: "#1A100C",
                    border: "none",
                    borderRadius: "16px",
                    color: "#fff",
                    fontSize: "12px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                  }}
                  itemStyle={{ color: "#E85D75", fontWeight: "bold" }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#E85D75"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Best-Selling Handcrafted Cakes */}
        <div className="overflow-hidden rounded-3xl border border-[#EFE4DB] bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between mb-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-rose">Customer Favorites</span>
              <h2 className="font-display text-xl font-bold text-[#1A100C]">Top Selling Cakes</h2>
            </div>
            <Link to="/admin/products" className="text-xs font-bold text-rose hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-4">
            {bestSellers.map((cake) => (
              <div
                key={cake.id}
                className="flex items-center gap-3.5 rounded-2xl border border-[#EFE4DB] bg-[#FAF7F2] p-3 transition-colors hover:border-rose/30"
              >
                <img
                  src={cake.image}
                  alt={cake.name}
                  className="h-12 w-12 rounded-xl object-cover shadow-soft"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-display text-sm font-bold text-[#1A100C] truncate">
                    {cake.name}
                  </h4>
                  <p className="text-xs text-[#8C7A70] capitalize">{cake.category}</p>
                </div>
                <div className="text-right">
                  <span className="font-display text-sm font-bold text-rose">
                    {formatINR(cake.price)}
                  </span>
                  <span className="block text-[0.65rem] text-emerald-600 font-semibold">High Demand</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Recent Orders Table */}
      <div className="mt-8 overflow-hidden rounded-3xl border border-[#EFE4DB] bg-white shadow-soft">
        <div className="flex items-center justify-between border-b border-[#EFE4DB] p-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-rose">Live Orders</span>
            <h2 className="font-display text-xl font-bold text-[#1A100C]">Recent Customer Inquiries & Orders</h2>
          </div>
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link to="/admin/orders">
              <span>View All Orders</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F2] text-[0.7rem] uppercase tracking-wider text-[#8C7A70]">
              <tr>
                <th className="px-6 py-4 font-bold">Order ID</th>
                <th className="px-6 py-4 font-bold">Customer</th>
                <th className="px-6 py-4 font-bold">Cake Item</th>
                <th className="px-6 py-4 font-bold">Delivery Date</th>
                <th className="px-6 py-4 font-bold">Total</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE4DB]">
              {recentOrders.map((ord) => (
                <tr key={ord.id} className="transition-colors hover:bg-[#FAF7F2]/60">
                  <td className="px-6 py-4 font-mono font-bold text-[#1A100C]">{ord.id}</td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-[#1A100C]">{ord.customerName}</p>
                    <p className="text-[0.65rem] text-[#8C7A70]">{ord.customerPhone}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-[#1A100C] truncate max-w-[200px]">
                      {ord.items[0]?.productName || "Custom Celebration Cake"}
                    </p>
                    {ord.cakeMessage && (
                      <p className="text-[0.65rem] italic text-rose">"{ord.cakeMessage}"</p>
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium text-[#5C4D44]">
                    {ord.deliveryDate || "As soon as possible"}
                  </td>
                  <td className="px-6 py-4 font-display font-bold text-[#1A100C]">
                    {formatINR(ord.totalAmount)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block rounded-full border px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider ${getStatusBadge(
                        ord.status,
                      )}`}
                    >
                      {ord.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button asChild size="sm" variant="ghost" className="h-8 text-rose hover:bg-rose/10">
                      <Link to="/admin/orders">
                        <span>Details</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

