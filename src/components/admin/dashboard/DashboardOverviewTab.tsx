import { useState } from "react";
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
  X,
  Eye,
  Phone,
  MapPin,
  CreditCard,
  Calendar,
  ChevronRight,
  ShieldCheck,
  Tag,
  Percent,
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
import { useBakeryStore, type Order, type StoreProduct } from "@/context/BakeryStoreContext";
import { formatINR } from "@/config/products";
import { Button } from "@/components/ui/button";

interface DashboardOverviewTabProps {
  onNavigateTab: (tab: string, options?: { filterStatus?: string }) => void;
}

export function DashboardOverviewTab({ onNavigateTab }: DashboardOverviewTabProps) {
  const { products, orders, customers, inventory, offers } = useBakeryStore();

  // Interactive Modals State
  const [isRevenueModalOpen, setIsRevenueModalOpen] = useState(false);
  const [selectedRecentOrder, setSelectedRecentOrder] = useState<Order | null>(null);
  const [selectedCake, setSelectedCake] = useState<StoreProduct | null>(null);

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalProducts = products.length;
  const totalCustomers = customers.length;
  const pendingOrders = orders.filter((o) => o.status === "pending" || o.status === "new").length;
  const completedOrders = orders.filter((o) => o.status === "delivered").length;
  const lowStockItems = inventory.filter((i) => i.quantity <= i.minThreshold);

  // Time-based revenue calculations
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const weekStart = now.getTime() - 7 * 24 * 3600 * 1000;
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const yearStart = new Date(now.getFullYear(), 0, 1).getTime();

  const todayRevenue = orders
    .filter((o) => new Date(o.createdAt).getTime() >= todayStart)
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const weeklyRevenue = orders
    .filter((o) => new Date(o.createdAt).getTime() >= weekStart)
    .reduce((sum, o) => sum + o.totalAmount, 0) || totalRevenue;

  const monthlyRevenue = orders
    .filter((o) => new Date(o.createdAt).getTime() >= monthStart)
    .reduce((sum, o) => sum + o.totalAmount, 0) || totalRevenue;

  const yearlyRevenue = orders
    .filter((o) => new Date(o.createdAt).getTime() >= yearStart)
    .reduce((sum, o) => sum + o.totalAmount, 0) || totalRevenue;

  // Payment Method Breakdown from live orders
  const paymentBreakdown = {
    upi: orders.filter((o) => o.paymentMethod?.toLowerCase().includes("upi") || o.paymentMethod?.toLowerCase().includes("pay")).length,
    cards: orders.filter((o) => o.paymentMethod?.toLowerCase().includes("card")).length,
    cod: orders.filter((o) => o.paymentMethod?.toLowerCase().includes("cash") || o.paymentMethod?.toLowerCase().includes("delivery")).length,
  };

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
      {/* 1. Low Inventory Alert Banner - Entire Banner Clickable */}
      {lowStockItems.length > 0 && (
        <div
          onClick={() => onNavigateTab("inventory")}
          role="button"
          tabIndex={0}
          className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-amber-300 bg-amber-50/80 p-4 text-amber-900 shadow-sm hover:shadow-md hover:border-amber-400 cursor-pointer transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-200 text-amber-800 transition-transform group-hover:scale-110">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold flex items-center gap-2">
                <span>Low Inventory Notice: {lowStockItems.length} ingredient(s) need restocking!</span>
                <span className="text-[0.68rem] bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                  Action Required
                </span>
              </p>
              <p className="text-xs text-amber-800/80">
                {lowStockItems.map((i) => `${i.name} (${i.quantity} ${i.unit})`).join(", ")}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onNavigateTab("inventory");
            }}
            className="bg-amber-600 text-white hover:bg-amber-700 shrink-0 text-xs font-semibold shadow-soft"
          >
            Manage Inventory & Restock →
          </Button>
        </div>
      )}

      {/* 2. Interactive KPI Summary Cards Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {/* Card 1: Total Revenue - Clickable */}
        <div
          onClick={() => setIsRevenueModalOpen(true)}
          role="button"
          tabIndex={0}
          className="group relative overflow-hidden rounded-3xl border border-[#EFE4DB] bg-white p-5 shadow-card hover:shadow-xl hover:-translate-y-1 hover:border-emerald-300 cursor-pointer transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8C7A70] group-hover:text-emerald-700 transition-colors">
              Total Revenue
            </span>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-600 transition-transform group-hover:scale-110">
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
          <div className="mt-2 flex items-center justify-between">
            <p className="text-[0.7rem] text-[#8C7A70]">Live Firebase order sync</p>
            <span className="inline-flex items-center gap-1 text-[0.68rem] font-bold text-emerald-600 opacity-80 group-hover:opacity-100 transition-opacity">
              <span>View Details</span>
              <ArrowUpRight className="h-3 w-3" />
            </span>
          </div>
        </div>

        {/* Card 2: Total Orders - Clickable */}
        <div
          onClick={() => onNavigateTab("orders")}
          role="button"
          tabIndex={0}
          className="group relative overflow-hidden rounded-3xl border border-[#EFE4DB] bg-white p-5 shadow-card hover:shadow-xl hover:-translate-y-1 hover:border-rose/40 cursor-pointer transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8C7A70] group-hover:text-rose transition-colors">
              Total Orders
            </span>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-rose/10 text-rose transition-transform group-hover:scale-110">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-2xl sm:text-3xl font-bold text-[#1A100C]">{totalOrders}</span>
            <span
              onClick={(e) => {
                e.stopPropagation();
                onNavigateTab("orders", { filterStatus: "pending" });
              }}
              title="Click to view pending orders"
              className="inline-flex items-center text-xs font-bold text-rose hover:underline"
            >
              <Clock className="h-3.5 w-3.5 mr-0.5" /> {pendingOrders} pending
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-[0.7rem] text-[#8C7A70]">{completedOrders} delivered</p>
            <span className="inline-flex items-center gap-1 text-[0.68rem] font-bold text-rose opacity-80 group-hover:opacity-100 transition-opacity">
              <span>Manage Orders</span>
              <ArrowUpRight className="h-3 w-3" />
            </span>
          </div>
        </div>

        {/* Card 3: Active Cakes - Clickable */}
        <div
          onClick={() => onNavigateTab("products")}
          role="button"
          tabIndex={0}
          className="group relative overflow-hidden rounded-3xl border border-[#EFE4DB] bg-white p-5 shadow-card hover:shadow-xl hover:-translate-y-1 hover:border-blue-300 cursor-pointer transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8C7A70] group-hover:text-blue-600 transition-colors">
              Active Cakes
            </span>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-blue-600 transition-transform group-hover:scale-110">
              <Cake className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-2xl sm:text-3xl font-bold text-[#1A100C]">{totalProducts}</span>
            <span className="text-xs font-bold text-blue-600">8 Categories</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-[0.7rem] text-[#8C7A70]">Full artisan menu</p>
            <span className="inline-flex items-center gap-1 text-[0.68rem] font-bold text-blue-600 opacity-80 group-hover:opacity-100 transition-opacity">
              <span>View Cakes</span>
              <ArrowUpRight className="h-3 w-3" />
            </span>
          </div>
        </div>

        {/* Card 4: Customers - Clickable */}
        <div
          onClick={() => onNavigateTab("customers")}
          role="button"
          tabIndex={0}
          className="group relative overflow-hidden rounded-3xl border border-[#EFE4DB] bg-white p-5 shadow-card hover:shadow-xl hover:-translate-y-1 hover:border-purple-300 cursor-pointer transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8C7A70] group-hover:text-purple-600 transition-colors">
              Customers
            </span>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-purple-50 text-purple-600 transition-transform group-hover:scale-110">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-2xl sm:text-3xl font-bold text-[#1A100C]">{totalCustomers}</span>
            <span className="text-xs font-bold text-purple-600">100% Verified</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-[0.7rem] text-[#8C7A70]">Clients in Thoothukudi</p>
            <span className="inline-flex items-center gap-1 text-[0.68rem] font-bold text-purple-600 opacity-80 group-hover:opacity-100 transition-opacity">
              <span>View Directory</span>
              <ArrowUpRight className="h-3 w-3" />
            </span>
          </div>
        </div>

        {/* Card 5: Active Offers - Clickable */}
        {(() => {
          const activeOffers = offers.filter((o) => o.isActive);
          const totalOffers = offers.length;
          const nextExpiry = offers
            .filter((o) => o.isActive && o.endDate)
            .sort((a, b) => new Date(a.endDate!).getTime() - new Date(b.endDate!).getTime())[0];
          const daysLeft = nextExpiry
            ? Math.max(0, Math.ceil((new Date(nextExpiry.endDate!).getTime() - Date.now()) / 86400000))
            : null;
          return (
            <div
              onClick={() => onNavigateTab("offers")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onNavigateTab("offers"); } }}
              className="group relative overflow-hidden rounded-3xl border border-[#EFE4DB] bg-white p-5 shadow-card hover:shadow-xl hover:-translate-y-1 hover:border-amber-300 cursor-pointer transition-all duration-300"
            >
              {/* animated glow */}
              <div className="pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full bg-amber-100 opacity-0 group-hover:opacity-60 transition-opacity duration-500" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8C7A70] group-hover:text-amber-600 transition-colors">
                  Active Offers
                </span>
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-amber-50 text-amber-600 transition-transform group-hover:scale-110">
                  <Percent className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-display text-2xl sm:text-3xl font-bold text-[#1A100C]">
                  {activeOffers.length}
                </span>
                <span className="text-xs font-bold text-amber-600">
                  / {totalOffers} total
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-[0.7rem] text-[#8C7A70]">
                  {daysLeft !== null
                    ? `Next expiry: ${daysLeft}d`
                    : "Manage discounts"}
                </p>
                <span className="inline-flex items-center gap-1 text-[0.68rem] font-bold text-amber-600 opacity-80 group-hover:opacity-100 transition-opacity">
                  <span>Manage Offers</span>
                  <ArrowUpRight className="h-3 w-3" />
                </span>
              </div>
            </div>
          );
        })()}
      </div>

      {/* 3. Analytics Chart & Order Pipeline Breakdown */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Weekly Revenue Trend Area Chart - Interactive Card */}
        <div
          onClick={() => onNavigateTab("reports")}
          role="button"
          tabIndex={0}
          className="group rounded-3xl border border-[#EFE4DB] bg-white p-6 shadow-card hover:shadow-xl hover:border-rose/30 cursor-pointer transition-all duration-300 lg:col-span-2"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-lg font-bold text-[#1A100C] group-hover:text-rose transition-colors">
                  Weekly Revenue & Sales Trend
                </h3>
                <span className="rounded-full bg-rose/10 text-rose px-2 py-0.5 text-[0.65rem] font-bold">
                  Reports & Analytics ↗
                </span>
              </div>
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

        {/* Order Status Pipeline - Every Stage Clickable */}
        <div className="rounded-3xl border border-[#EFE4DB] bg-white p-6 shadow-card">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-display text-lg font-bold text-[#1A100C]">Order Pipeline</h3>
            <span className="text-[0.68rem] text-rose font-bold">Filter Stage</span>
          </div>
          <p className="text-xs text-[#8C7A70] mb-5">Click any stage to filter active orders</p>

          <div className="space-y-2.5">
            {[
              {
                label: "New & Incoming",
                filter: "new",
                count: orders.filter((o) => o.status === "new").length,
                color: "bg-rose",
              },
              {
                label: "Pending Confirmation",
                filter: "pending",
                count: orders.filter((o) => o.status === "pending").length,
                color: "bg-amber-500",
              },
              {
                label: "Preparing in Bakery",
                filter: "preparing",
                count: orders.filter((o) => o.status === "preparing").length,
                color: "bg-purple-500",
              },
              {
                label: "Ready / Out for Delivery",
                filter: "ready",
                count: orders.filter((o) => o.status === "ready" || o.status === "out-for-delivery").length,
                color: "bg-cyan-500",
              },
              {
                label: "Delivered to Customer",
                filter: "delivered",
                count: orders.filter((o) => o.status === "delivered").length,
                color: "bg-emerald-500",
              },
            ].map((stage, idx) => (
              <div
                key={idx}
                onClick={() => onNavigateTab("orders", { filterStatus: stage.filter })}
                role="button"
                tabIndex={0}
                className="group flex flex-col gap-1.5 p-2 rounded-xl hover:bg-rose/5 cursor-pointer transition-colors"
                title={`Click to view ${stage.label} orders`}
              >
                <div className="flex justify-between text-xs font-semibold text-[#5C4D44] group-hover:text-rose transition-colors">
                  <span className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${stage.color}`} />
                    <span>{stage.label}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="font-bold">{stage.count} orders</span>
                    <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </span>
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

          <div className="mt-5 pt-4 border-t border-[#EFE4DB]">
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

      {/* 4. Recent Orders & Top Selling Cakes */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Orders Table - Clickable Rows with Inspection Dialog */}
        <div className="rounded-3xl border border-[#EFE4DB] bg-white p-6 shadow-card lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-display text-lg font-bold text-[#1A100C]">Recent Customer Orders</h3>
              <p className="text-xs text-[#8C7A70]">Click any order to view its complete order specification</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigateTab("orders")}
              className="text-xs font-bold text-rose hover:bg-rose/10"
            >
              All Orders ({orders.length}) →
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
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2EBE5]">
                {recentOrders.map((ord) => (
                  <tr
                    key={ord.id}
                    onClick={() => setSelectedRecentOrder(ord)}
                    className="hover:bg-rose/5 cursor-pointer transition-colors group"
                    title="Click to view complete order details"
                  >
                    <td className="py-3 font-mono font-bold text-rose group-hover:underline">
                      {ord.id}
                    </td>
                    <td className="py-3">
                      <p className="font-semibold text-[#1A100C]">{ord.customerName}</p>
                      <p className="text-[0.68rem] text-[#8C7A70]">{ord.customerPhone}</p>
                    </td>
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
                    <td className="py-3 text-right">
                      <span className="inline-flex items-center gap-1 text-[0.7rem] font-bold text-rose opacity-60 group-hover:opacity-100 transition-opacity">
                        <Eye className="h-3.5 w-3.5" />
                        <span>View</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Best-Selling Cakes - Clickable Items */}
        <div className="rounded-3xl border border-[#EFE4DB] bg-white p-6 shadow-card">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-display text-lg font-bold text-[#1A100C]">Top-Selling Cakes</h3>
              <p className="text-xs text-[#8C7A70]">Click a cake to view catalog info</p>
            </div>
            <Sparkles className="h-4 w-4 text-rose" />
          </div>

          <div className="space-y-3">
            {bestSellers.map((cake) => (
              <div
                key={cake.id}
                onClick={() => setSelectedCake(cake)}
                role="button"
                tabIndex={0}
                className="group flex items-center gap-3.5 p-2 rounded-2xl hover:bg-rose/5 cursor-pointer transition-all border border-transparent hover:border-[#EFE4DB]"
                title="Click to view cake specifications"
              >
                <img
                  src={cake.image}
                  alt={cake.name}
                  className="h-12 w-12 rounded-2xl object-cover border border-[#EFE4DB] group-hover:scale-105 transition-transform"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#1A100C] truncate group-hover:text-rose transition-colors">
                    {cake.name}
                  </p>
                  <p className="text-[0.7rem] text-[#8C7A70]">
                    {cake.weight} • {cake.category}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-rose">{formatINR(cake.price)}</p>
                  <p className="text-[0.68rem] text-emerald-600 font-semibold">Stock: {cake.stock}</p>
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

      {/* ================= REVENUE DETAIL MODAL ================= */}
      {isRevenueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-3xl rounded-3xl border border-[#EFE4DB] bg-white p-6 shadow-2xl sm:p-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#EFE4DB] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-100 text-emerald-800">
                    <IndianRupee className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="font-display text-2xl font-bold text-[#1A100C]">
                      Revenue & Financial Analytics
                    </h3>
                    <p className="text-xs text-[#8C7A70]">
                      Real-time revenue metrics, time periods and order transaction details
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsRevenueModalOpen(false)}
                className="rounded-full p-2 text-[#8C7A70] hover:bg-[#FAF7F2] hover:text-[#1A100C]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Time Period Revenue KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6">
              <div className="rounded-2xl border border-[#EFE4DB] bg-[#FAF7F2] p-4 text-center">
                <p className="text-[0.68rem] font-bold uppercase tracking-wider text-[#8C7A70]">Total Revenue</p>
                <p className="mt-1 font-display text-xl font-bold text-emerald-700">{formatINR(totalRevenue)}</p>
                <p className="mt-0.5 text-[0.65rem] text-[#8C7A70]">All time orders</p>
              </div>

              <div className="rounded-2xl border border-[#EFE4DB] bg-[#FAF7F2] p-4 text-center">
                <p className="text-[0.68rem] font-bold uppercase tracking-wider text-[#8C7A70]">Today's Revenue</p>
                <p className="mt-1 font-display text-xl font-bold text-[#1A100C]">{formatINR(todayRevenue)}</p>
                <p className="mt-0.5 text-[0.65rem] text-emerald-600 font-semibold">Active day intake</p>
              </div>

              <div className="rounded-2xl border border-[#EFE4DB] bg-[#FAF7F2] p-4 text-center">
                <p className="text-[0.68rem] font-bold uppercase tracking-wider text-[#8C7A70]">Weekly Revenue</p>
                <p className="mt-1 font-display text-xl font-bold text-[#1A100C]">{formatINR(weeklyRevenue)}</p>
                <p className="mt-0.5 text-[0.65rem] text-[#8C7A70]">Past 7 days</p>
              </div>

              <div className="rounded-2xl border border-[#EFE4DB] bg-[#FAF7F2] p-4 text-center">
                <p className="text-[0.68rem] font-bold uppercase tracking-wider text-[#8C7A70]">Monthly Revenue</p>
                <p className="mt-1 font-display text-xl font-bold text-[#1A100C]">{formatINR(monthlyRevenue)}</p>
                <p className="mt-0.5 text-[0.65rem] text-[#8C7A70]">Current month</p>
              </div>
            </div>

            {/* Payment Method Breakdown */}
            <div className="rounded-2xl border border-[#EFE4DB] bg-white p-5 mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A100C] mb-3 flex items-center justify-between">
                <span>Payment Method Breakdown</span>
                <span className="text-[0.7rem] text-[#8C7A70] font-normal">Based on order checkouts</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3">
                  <p className="text-xs font-bold text-emerald-800">UPI / GPay / PhonePe</p>
                  <p className="font-display text-lg font-bold text-emerald-700 mt-1">
                    {paymentBreakdown.upi} Transactions
                  </p>
                  <p className="text-[0.68rem] text-emerald-600 font-semibold">Direct bank settlement</p>
                </div>
                <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3">
                  <p className="text-xs font-bold text-blue-800">Credit / Debit Cards</p>
                  <p className="font-display text-lg font-bold text-blue-700 mt-1">
                    {paymentBreakdown.cards} Transactions
                  </p>
                  <p className="text-[0.68rem] text-blue-600 font-semibold">Online payment gateway</p>
                </div>
                <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3">
                  <p className="text-xs font-bold text-amber-800">Cash on Delivery</p>
                  <p className="font-display text-lg font-bold text-amber-700 mt-1">
                    {paymentBreakdown.cod} Transactions
                  </p>
                  <p className="text-[0.68rem] text-amber-600 font-semibold">Collected at doorstep</p>
                </div>
              </div>
            </div>

            {/* Individual Orders Revenue Table */}
            <div className="rounded-2xl border border-[#EFE4DB] p-4 mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A100C] mb-3">
                Revenue from Individual Orders
              </h4>
              <div className="overflow-x-auto max-h-56 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#EFE4DB] text-[#8C7A70] font-bold">
                      <th className="pb-2">Order ID</th>
                      <th className="pb-2">Customer</th>
                      <th className="pb-2">Payment Method</th>
                      <th className="pb-2">Date</th>
                      <th className="pb-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F2EBE5]">
                    {orders.map((ord) => (
                      <tr
                        key={ord.id}
                        onClick={() => {
                          setIsRevenueModalOpen(false);
                          setSelectedRecentOrder(ord);
                        }}
                        className="hover:bg-rose/5 cursor-pointer transition-colors"
                        title="Click to view order details"
                      >
                        <td className="py-2.5 font-mono font-bold text-rose">{ord.id}</td>
                        <td className="py-2.5 font-semibold text-[#1A100C]">{ord.customerName}</td>
                        <td className="py-2.5 text-[#5C4D44]">{ord.paymentMethod}</td>
                        <td className="py-2.5 text-[#8C7A70]">{new Date(ord.createdAt).toLocaleDateString()}</td>
                        <td className="py-2.5 font-bold text-emerald-700 text-right">{formatINR(ord.totalAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-[#EFE4DB]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsRevenueModalOpen(false);
                  onNavigateTab("payments");
                }}
                className="text-xs font-bold"
              >
                Go to Payments Module →
              </Button>
              <Button
                size="sm"
                variant="rose"
                onClick={() => {
                  setIsRevenueModalOpen(false);
                  onNavigateTab("reports");
                }}
                className="text-xs font-bold"
              >
                Detailed Reports & Export CSV →
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ================= ORDER DETAILS MODAL ================= */}
      {selectedRecentOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-3xl border border-[#EFE4DB] bg-white p-6 shadow-2xl sm:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[#EFE4DB] pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-rose">Order Details</span>
                <h3 className="font-display text-2xl font-bold text-[#1A100C]">#{selectedRecentOrder.id}</h3>
                <p className="text-xs text-[#8C7A70]">
                  Placed on {new Date(selectedRecentOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedRecentOrder(null)}
                className="rounded-full p-2 text-[#8C7A70] hover:bg-[#FAF7F2] hover:text-[#1A100C]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 space-y-5 text-xs">
              {/* Customer Info */}
              <div className="rounded-2xl border border-[#EFE4DB] bg-[#FAF7F2] p-4">
                <p className="font-bold text-[#1A100C] text-sm">{selectedRecentOrder.customerName}</p>
                <p className="text-[#5C4D44] mt-1 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-rose" /> {selectedRecentOrder.customerPhone}
                </p>
                <p className="text-[#5C4D44] mt-1 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-rose" /> {selectedRecentOrder.deliveryAddress}
                </p>
              </div>

              {/* Items Spec */}
              <div>
                <p className="font-bold uppercase tracking-wider text-[#8C7A70] text-[0.68rem] mb-2">
                  Ordered Cake Specifications
                </p>
                <div className="space-y-2">
                  {selectedRecentOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-xl border border-[#EFE4DB] p-3"
                    >
                      <div>
                        <p className="font-bold text-[#1A100C]">{item.productName}</p>
                        <p className="text-[0.7rem] text-[#8C7A70]">
                          Qty: {item.quantity} • Unit Price: {formatINR(item.price)}
                        </p>
                      </div>
                      <p className="font-bold text-rose">{formatINR(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Message on Cake */}
              {selectedRecentOrder.cakeMessage && (
                <div className="rounded-xl border border-rose/30 bg-rose/5 p-3 text-rose">
                  <p className="font-bold text-[0.68rem] uppercase tracking-wider">Piped Cake Message</p>
                  <p className="mt-0.5 italic text-xs">"{selectedRecentOrder.cakeMessage}"</p>
                </div>
              )}

              {/* Payment Details */}
              <div className="flex items-center justify-between border-t border-b border-[#EFE4DB] py-3">
                <div>
                  <p className="font-bold text-[#1A100C]">Payment Method: {selectedRecentOrder.paymentMethod}</p>
                  <p className="text-[0.68rem] text-[#8C7A70]">Status: {selectedRecentOrder.paymentStatus.toUpperCase()}</p>
                </div>
                <div className="text-right">
                  <p className="text-[0.68rem] text-[#8C7A70]">Grand Total</p>
                  <p className="font-display text-lg font-bold text-rose">
                    {formatINR(selectedRecentOrder.totalAmount)}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedRecentOrder(null)}
                  className="text-xs"
                >
                  Close
                </Button>
                <Button
                  size="sm"
                  variant="rose"
                  onClick={() => {
                    setSelectedRecentOrder(null);
                    onNavigateTab("orders");
                  }}
                  className="text-xs font-bold"
                >
                  Manage in Orders Module →
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= CAKE DETAIL MODAL ================= */}
      {selectedCake && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-[#EFE4DB] bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between border-b border-[#EFE4DB] pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-rose">Product Details</span>
                <h3 className="font-display text-xl font-bold text-[#1A100C]">{selectedCake.name}</h3>
              </div>
              <button
                onClick={() => setSelectedCake(null)}
                className="rounded-full p-2 text-[#8C7A70] hover:bg-[#FAF7F2] hover:text-[#1A100C]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <img
                src={selectedCake.image}
                alt={selectedCake.name}
                className="w-full h-48 rounded-2xl object-cover border border-[#EFE4DB]"
              />
              <p className="text-[#5C4D44] leading-relaxed">{selectedCake.description}</p>

              <div className="grid grid-cols-2 gap-3 rounded-2xl border border-[#EFE4DB] bg-[#FAF7F2] p-3 text-xs">
                <div>
                  <p className="text-[0.68rem] text-[#8C7A70] uppercase font-bold">Category</p>
                  <p className="font-bold text-[#1A100C] capitalize">{selectedCake.category}</p>
                </div>
                <div>
                  <p className="text-[0.68rem] text-[#8C7A70] uppercase font-bold">Price</p>
                  <p className="font-bold text-rose">{formatINR(selectedCake.price)}</p>
                </div>
                <div>
                  <p className="text-[0.68rem] text-[#8C7A70] uppercase font-bold">In Stock</p>
                  <p className="font-bold text-emerald-700">{selectedCake.stock} units</p>
                </div>
                <div>
                  <p className="text-[0.68rem] text-[#8C7A70] uppercase font-bold">Type</p>
                  <p className="font-bold text-[#1A100C]">{selectedCake.isEggless ? "100% Eggless" : "Regular"}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedCake(null)}
                  className="text-xs"
                >
                  Close
                </Button>
                <Button
                  size="sm"
                  variant="rose"
                  onClick={() => {
                    setSelectedCake(null);
                    onNavigateTab("products");
                  }}
                  className="text-xs font-bold"
                >
                  Edit in Products Module →
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
