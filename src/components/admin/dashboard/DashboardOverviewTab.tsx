import {
  ShoppingBag,
  IndianRupee,
  Cake,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useBakeryStore, type Order } from "@/context/BakeryStoreContext";
import { formatINR } from "@/config/products";
import { Button } from "@/components/ui/button";

interface DashboardOverviewTabProps {
  onNavigateTab: (tab: string) => void;
}

export function DashboardOverviewTab({ onNavigateTab }: DashboardOverviewTabProps) {
  const { products, orders, customers, inventory } = useBakeryStore();

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalProducts = products.length;
  const totalCustomers = customers.length;
  const pendingOrders = orders.filter((o) => o.status === "pending" || o.status === "new").length;
  const completedOrders = orders.filter((o) => o.status === "delivered").length;
  const lowStockItems = inventory.filter((i) => i.quantity <= i.minThreshold);

  // Weekly Revenue Chart data
  const revenueTrendData = [
    { day: "Mon", revenue: 4200, orders: 4 },
    { day: "Tue", revenue: 5800, orders: 6 },
    { day: "Wed", revenue: 4100, orders: 3 },
    { day: "Thu", revenue: 7900, orders: 8 },
    { day: "Fri", revenue: 11500, orders: 12 },
    { day: "Sat", revenue: 17200, orders: 17 },
    { day: "Sun", revenue: 15400, orders: 14 },
  ];

  // Best selling products
  const bestSellers = products
    .filter((p) => p.isFeatured || p.price >= 800)
    .slice(0, 4);

  const recentOrders = orders.slice(0, 5);

  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "new":
        return "bg-rose/10 text-rose border-rose/30";
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "confirmed":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "preparing":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "ready":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "out-for-delivery":
        return "bg-cyan-50 text-cyan-700 border-cyan-200";
      case "delivered":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "cancelled":
        return "bg-gray-100 text-gray-500 border-gray-200";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="space-y-8">
      {/* Low Stock Alert Banner */}
      {lowStockItems.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-amber-300 bg-amber-50/80 p-4 text-amber-900 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-200 text-amber-800">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold">
                Low Inventory Notice: {lowStockItems.length} ingredient(s) need restocking!
              </p>
              <p className="text-xs text-amber-800/80">
                {lowStockItems.map((i) => `${i.name} (${i.quantity} ${i.unit})`).join(", ")}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => onNavigateTab("inventory")}
            className="bg-amber-600 text-white hover:bg-amber-700 shrink-0 text-xs font-semibold"
          >
            Manage Inventory
          </Button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Total Revenue */}
        <div className="relative overflow-hidden rounded-3xl border border-[#EFE4DB] bg-white p-5 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8C7A70]">Total Revenue</span>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
              <IndianRupee className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-2xl sm:text-3xl font-bold text-[#1A100C]">
              {formatINR(totalRevenue)}
            </span>
            <span className="inline-flex items-center text-xs font-bold text-emerald-600">
              <TrendingUp className="h-3.5 w-3.5 mr-0.5" /> +18.4%
            </span>
          </div>
          <p className="mt-1 text-[0.7rem] text-[#8C7A70]">Synchronized from customer orders</p>
        </div>

        {/* Total Orders */}
        <div className="relative overflow-hidden rounded-3xl border border-[#EFE4DB] bg-white p-5 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8C7A70]">Total Orders</span>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-rose/10 text-rose">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-2xl sm:text-3xl font-bold text-[#1A100C]">{totalOrders}</span>
            <span className="inline-flex items-center text-xs font-bold text-rose">
              <Clock className="h-3.5 w-3.5 mr-0.5" /> {pendingOrders} pending
            </span>
          </div>
          <p className="mt-1 text-[0.7rem] text-[#8C7A70]">{completedOrders} successfully delivered</p>
        </div>

        {/* Cake Products */}
        <div className="relative overflow-hidden rounded-3xl border border-[#EFE4DB] bg-white p-5 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8C7A70]">Active Cakes</span>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-blue-600">
              <Cake className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-2xl sm:text-3xl font-bold text-[#1A100C]">{totalProducts}</span>
            <span className="text-xs font-bold text-blue-600">8 Categories</span>
          </div>
          <p className="mt-1 text-[0.7rem] text-[#8C7A70]">Full artisan bakery catalog</p>
        </div>

        {/* Registered Customers */}
        <div className="relative overflow-hidden rounded-3xl border border-[#EFE4DB] bg-white p-5 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8C7A70]">Customers</span>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-purple-50 text-purple-600">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-2xl sm:text-3xl font-bold text-[#1A100C]">{totalCustomers}</span>
            <span className="text-xs font-bold text-purple-600">100% Verified</span>
          </div>
          <p className="mt-1 text-[0.7rem] text-[#8C7A70]">Repeat clients in Thoothukudi</p>
        </div>
      </div>

      {/* Analytics Chart & Order Status Overview */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Weekly Revenue Trend Area Chart */}
        <div className="rounded-3xl border border-[#EFE4DB] bg-white p-6 shadow-card lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h3 className="font-display text-lg font-bold text-[#1A100C]">Weekly Revenue & Sales Trend</h3>
              <p className="text-xs text-[#8C7A70]">Daily intake and order volume from website checkouts</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs font-medium text-[#5C4D44]">
                <span className="h-2.5 w-2.5 rounded-full bg-rose" /> Revenue (₹)
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="roseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C93B57" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#C93B57" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2EBE5" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#8C7A70" }} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "#8C7A70" }}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, "Revenue"]}
                  contentStyle={{
                    borderRadius: "16px",
                    border: "1px solid #EFE4DB",
                    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.08)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#C93B57"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#roseGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Breakdown */}
        <div className="rounded-3xl border border-[#EFE4DB] bg-white p-6 shadow-card">
          <h3 className="font-display text-lg font-bold text-[#1A100C]">Order Pipeline</h3>
          <p className="text-xs text-[#8C7A70] mb-5">Active orders by stage</p>

          <div className="space-y-3.5">
            {[
              { label: "New & Incoming", count: orders.filter((o) => o.status === "new").length, color: "bg-rose" },
              { label: "Pending Confirmation", count: orders.filter((o) => o.status === "pending").length, color: "bg-amber-500" },
              { label: "Preparing in Bakery", count: orders.filter((o) => o.status === "preparing").length, color: "bg-purple-500" },
              { label: "Ready / Out for Delivery", count: orders.filter((o) => o.status === "ready" || o.status === "out-for-delivery").length, color: "bg-cyan-500" },
              { label: "Delivered to Customer", count: orders.filter((o) => o.status === "delivered").length, color: "bg-emerald-500" },
            ].map((stage, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-[#5C4D44]">
                  <span>{stage.label}</span>
                  <span>{stage.count} orders</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#FAF7F2] overflow-hidden">
                  <div
                    className={`h-full rounded-full ${stage.color} transition-all duration-500`}
                    style={{ width: `${totalOrders > 0 ? (stage.count / totalOrders) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-5 border-t border-[#EFE4DB]">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateTab("orders")}
              className="w-full text-xs font-bold text-rose border-rose/30 hover:bg-rose/10"
            >
              <span>View Full Order Management →</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Recent Orders & Top Selling Cakes */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Orders Table */}
        <div className="rounded-3xl border border-[#EFE4DB] bg-white p-6 shadow-card lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-display text-lg font-bold text-[#1A100C]">Recent Customer Orders</h3>
              <p className="text-xs text-[#8C7A70]">Live incoming bakery orders</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigateTab("orders")}
              className="text-xs font-bold text-rose hover:bg-rose/10"
            >
              All Orders ({orders.length})
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#EFE4DB] text-[#8C7A70] uppercase font-bold tracking-wider">
                  <th className="pb-3">Order ID</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Items</th>
                  <th className="pb-3">Total</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2EBE5]">
                {recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                    <td className="py-3 font-mono font-bold text-rose">{ord.id}</td>
                    <td className="py-3 font-semibold text-[#1A100C]">{ord.customerName}</td>
                    <td className="py-3 text-[#5C4D44] max-w-xs truncate">
                      {ord.items.map((i) => `${i.productName} (x${i.quantity})`).join(", ")}
                    </td>
                    <td className="py-3 font-bold text-[#1A100C]">{formatINR(ord.totalAmount)}</td>
                    <td className="py-3">
                      <span
                        className={`inline-block rounded-full border px-2.5 py-0.5 text-[0.68rem] font-bold uppercase tracking-wider ${getStatusBadge(
                          ord.status
                        )}`}
                      >
                        {ord.status.replace(/-/g, " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Best-Selling Cakes */}
        <div className="rounded-3xl border border-[#EFE4DB] bg-white p-6 shadow-card">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-display text-lg font-bold text-[#1A100C]">Top-Selling Cakes</h3>
              <p className="text-xs text-[#8C7A70]">Most popular bakery selections</p>
            </div>
            <Sparkles className="h-4 w-4 text-rose" />
          </div>

          <div className="space-y-4">
            {bestSellers.map((cake) => (
              <div key={cake.id} className="flex items-center gap-3.5">
                <img
                  src={cake.image}
                  alt={cake.name}
                  className="h-12 w-12 rounded-2xl object-cover border border-[#EFE4DB]"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#1A100C] truncate">{cake.name}</p>
                  <p className="text-[0.7rem] text-[#8C7A70]">{cake.weight} • {cake.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-rose">{formatINR(cake.price)}</p>
                  <p className="text-[0.68rem] text-emerald-600 font-semibold">In Stock ({cake.stock})</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-5 border-t border-[#EFE4DB]">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateTab("products")}
              className="w-full text-xs font-bold text-[#5C4D44] hover:bg-[#FAF7F2]"
            >
              Manage All Products →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
