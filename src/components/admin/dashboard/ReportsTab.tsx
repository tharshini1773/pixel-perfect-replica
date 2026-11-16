import { useState } from "react";
import {
  BarChart3,
  Download,
  Calendar,
  TrendingUp,
  IndianRupee,
  ShoppingBag,
  Users,
  PieChart as PieIcon,
  X,
  ChevronRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Package,
  HeartHandshake,
  UserCheck,
  UserPlus,
  Sparkles,
  Info,
  Check,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useBakeryStore, type Order } from "@/context/BakeryStoreContext";
import { formatINR } from "@/config/products";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ReportsTab() {
  const { orders, products, customers } = useBakeryStore();
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly" | "yearly">("monthly");

  // Modal States for the 4 Summary Cards
  const [isGrossSalesModalOpen, setIsGrossSalesModalOpen] = useState(false);
  const [isAovModalOpen, setIsAovModalOpen] = useState(false);
  const [isVolumeModalOpen, setIsVolumeModalOpen] = useState(false);
  const [isRetentionModalOpen, setIsRetentionModalOpen] = useState(false);

  // Selected order inspection for Modal 3
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const avgOrderValue = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;

  // Chart datasets
  const monthlyData = [
    { period: "Jun", sales: 48000, orders: 42 },
    { period: "Jul", sales: 54000, orders: 49 },
    { period: "Aug", sales: 62000, orders: 55 },
    { period: "Sep", sales: 71000, orders: 63 },
    { period: "Oct", sales: 84000, orders: 74 },
    { period: "Nov", sales: 96500, orders: 86 },
  ];

  const weeklyData = [
    { period: "Week 1", sales: 18500, orders: 19 },
    { period: "Week 2", sales: 22400, orders: 23 },
    { period: "Week 3", sales: 26100, orders: 27 },
    { period: "Week 4", sales: 29500, orders: 31 },
  ];

  const dailyData = [
    { period: "Mon", sales: 4200, orders: 4 },
    { period: "Tue", sales: 5800, orders: 6 },
    { period: "Wed", sales: 4100, orders: 3 },
    { period: "Thu", sales: 7900, orders: 8 },
    { period: "Fri", sales: 11500, orders: 12 },
    { period: "Sat", sales: 17200, orders: 17 },
    { period: "Sun", sales: 15400, orders: 14 },
  ];

  const yearlyData = [
    { period: "2023", sales: 480000, orders: 420 },
    { period: "2024", sales: 690000, orders: 610 },
    { period: "2025", sales: 940000, orders: 850 },
    { period: "2026 (YTD)", sales: 1120000, orders: 990 },
  ];

  const activeChartData =
    period === "daily"
      ? dailyData
      : period === "weekly"
      ? weeklyData
      : period === "yearly"
      ? yearlyData
      : monthlyData;

  // Dynamic period-based metrics mapping
  const periodMetricsMap = {
    daily: {
      periodLabel: "Daily Sales",
      grossSales: formatINR(5700),
      grossRaw: 5700,
      grossComparison: "+15% vs yesterday",
      aov: formatINR(1425),
      aovRaw: 1425,
      aovSubtext: "Today's avg ticket size",
      volume: "4 Orders",
      volumeRaw: 4,
      volumeSubtext: "Delivered & active today",
      retention: "75%",
      retentionRaw: 75,
      retentionSubtext: "Same-day repeat patronage",
      ordersFilter: orders.slice(0, 4),
    },
    weekly: {
      periodLabel: "Weekly Sales",
      grossSales: formatINR(totalRevenue),
      grossRaw: totalRevenue,
      grossComparison: "+18% vs previous week",
      aov: formatINR(avgOrderValue),
      aovRaw: avgOrderValue,
      aovSubtext: "Per weekly celebration",
      volume: `${orders.length} Orders`,
      volumeRaw: orders.length,
      volumeSubtext: "Active weekly volume",
      retention: "80%",
      retentionRaw: 80,
      retentionSubtext: "Weekly returning clients",
      ordersFilter: orders,
    },
    monthly: {
      periodLabel: "Monthly Sales",
      grossSales: formatINR(totalRevenue),
      grossRaw: totalRevenue,
      grossComparison: "+22% vs previous period",
      aov: formatINR(avgOrderValue),
      aovRaw: avgOrderValue,
      aovSubtext: "Per celebration order",
      volume: `${orders.length} Orders`,
      volumeRaw: orders.length,
      volumeSubtext: "Online & counter orders",
      retention: "78%",
      retentionRaw: 78,
      retentionSubtext: "Repeat customers in Punnaikayal",
      ordersFilter: orders,
    },
    yearly: {
      periodLabel: "Yearly Sales",
      grossSales: formatINR(1120000),
      grossRaw: 1120000,
      grossComparison: "+35% vs previous year",
      aov: formatINR(1131),
      aovRaw: 1131,
      aovSubtext: "Annualized average order",
      volume: "990 Orders",
      volumeRaw: 990,
      volumeSubtext: "Full year cumulative",
      retention: "82%",
      retentionRaw: 82,
      retentionSubtext: "Annual customer loyalty",
      ordersFilter: orders,
    },
  };

  const currentPeriodMetrics = periodMetricsMap[period];
  const activeOrders = currentPeriodMetrics.ordersFilter;

  // Date formatter
  const formatDate = (dateStr?: string | null | undefined) => {
    if (!dateStr) return "N/A";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // Product sales aggregation for Modal 1
  const productSalesMap = new Map<string, { name: string; quantity: number; revenue: number }>();
  activeOrders.forEach((order) => {
    order.items.forEach((item) => {
      const existing = productSalesMap.get(item.productName) || {
        name: item.productName,
        quantity: 0,
        revenue: 0,
      };
      existing.quantity += item.quantity;
      existing.revenue += item.total || item.price * item.quantity;
      productSalesMap.set(item.productName, existing);
    });
  });

  const productSalesBreakdown = Array.from(productSalesMap.values()).sort(
    (a, b) => b.revenue - a.revenue
  );

  // AOV calculations for Modal 2
  const highestOrder = activeOrders.reduce(
    (max, o) => (o.totalAmount > (max?.totalAmount || 0) ? o : max),
    activeOrders[0]
  );
  const lowestOrder = activeOrders.reduce(
    (min, o) => (o.totalAmount < (min?.totalAmount || Infinity) ? o : min),
    activeOrders[0]
  );

  // Volume status breakdowns for Modal 3
  const completedOrders = activeOrders.filter(
    (o) => o.status === "delivered" || o.paymentStatus === "paid"
  );
  const preparingOrders = activeOrders.filter(
    (o) => o.status === "preparing" || o.status === "ready" || o.status === "out-for-delivery"
  );
  const pendingOrders = activeOrders.filter(
    (o) => o.status === "new" || o.status === "pending" || o.status === "confirmed"
  );
  const cancelledOrders = activeOrders.filter((o) => o.status === "cancelled");

  // Retention metrics for Modal 4
  const returningCustomers = customers.filter((c) => c.totalOrders > 1);
  const newCustomers = customers.filter((c) => c.totalOrders <= 1);

  const downloadReportCSV = () => {
    const headers = "Order ID,Customer Name,Phone,Delivery Date,Items,Total Amount (INR),Status,Payment Status\n";
    const rows = orders
      .map(
        (o) =>
          `"${o.id}","${o.customerName}","${o.customerPhone}","${o.deliveryDate}","${o.items
            .map((i) => i.productName)
            .join("; ")}",${o.totalAmount},"${o.status}","${o.paymentStatus}"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Sweet_Crumbs_Bakery_Sales_Report_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Sales report CSV generated and downloaded!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-[#1A100C]">Reports & Bakery Analytics</h2>
          <p className="text-xs text-[#8C7A70]">Comprehensive financial summaries, sales trends and downloadable reports</p>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={downloadReportCSV} variant="rose" size="sm" className="gap-1.5 shadow-soft">
            <Download className="h-4 w-4" /> Download CSV Report
          </Button>
        </div>
      </div>

      {/* KPI Cards - All 4 Clickable & Interactive */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* CARD 1: Gross Bakery Sales */}
        <div
          onClick={() => setIsGrossSalesModalOpen(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setIsGrossSalesModalOpen(true);
            }
          }}
          className="rounded-3xl border border-[#EFE4DB] bg-white p-5 shadow-card cursor-pointer hover:shadow-lg hover:shadow-rose/10 hover:-translate-y-0.5 transition-all group text-left"
          title="Click to view detailed Gross Sales analytics"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8C7A70] group-hover:text-rose transition-colors">
              Gross Bakery Sales
            </span>
            <span className="text-[0.68rem] text-rose font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
              Analytics &rarr;
            </span>
          </div>
          <p className="font-display text-2xl font-bold text-[#1A100C] mt-2">{currentPeriodMetrics.grossSales}</p>
          <p className="text-[0.7rem] text-emerald-600 font-bold mt-0.5">{currentPeriodMetrics.grossComparison}</p>
        </div>

        {/* CARD 2: Average Order Value */}
        <div
          onClick={() => setIsAovModalOpen(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setIsAovModalOpen(true);
            }
          }}
          className="rounded-3xl border border-[#EFE4DB] bg-white p-5 shadow-card cursor-pointer hover:shadow-lg hover:shadow-rose/10 hover:-translate-y-0.5 transition-all group text-left"
          title="Click to view Average Order Value analysis"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8C7A70] group-hover:text-rose transition-colors">
              Average Order Value
            </span>
            <span className="text-[0.68rem] text-rose font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
              Analyze &rarr;
            </span>
          </div>
          <p className="font-display text-2xl font-bold text-rose mt-2">{currentPeriodMetrics.aov}</p>
          <p className="text-[0.7rem] text-[#8C7A70] mt-0.5">{currentPeriodMetrics.aovSubtext}</p>
        </div>

        {/* CARD 3: Total Volume */}
        <div
          onClick={() => setIsVolumeModalOpen(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setIsVolumeModalOpen(true);
            }
          }}
          className="rounded-3xl border border-[#EFE4DB] bg-white p-5 shadow-card cursor-pointer hover:shadow-lg hover:shadow-rose/10 hover:-translate-y-0.5 transition-all group text-left"
          title="Click to view Order Volume & pipeline details"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8C7A70] group-hover:text-rose transition-colors">
              Total Volume
            </span>
            <span className="text-[0.68rem] text-rose font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
              Breakdown &rarr;
            </span>
          </div>
          <p className="font-display text-2xl font-bold text-[#1A100C] mt-2">{currentPeriodMetrics.volume}</p>
          <p className="text-[0.7rem] text-[#8C7A70] mt-0.5">{currentPeriodMetrics.volumeSubtext}</p>
        </div>

        {/* CARD 4: Customer Retention */}
        <div
          onClick={() => setIsRetentionModalOpen(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setIsRetentionModalOpen(true);
            }
          }}
          className="rounded-3xl border border-[#EFE4DB] bg-white p-5 shadow-card cursor-pointer hover:shadow-lg hover:shadow-purple/20 hover:-translate-y-0.5 transition-all group text-left"
          title="Click to view Customer Retention analytics"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8C7A70] group-hover:text-purple-700 transition-colors">
              Customer Retention
            </span>
            <span className="text-[0.68rem] text-purple-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
              Retention &rarr;
            </span>
          </div>
          <p className="font-display text-2xl font-bold text-purple-600 mt-2">{currentPeriodMetrics.retention}</p>
          <p className="text-[0.7rem] text-[#8C7A70] mt-0.5">{currentPeriodMetrics.retentionSubtext}</p>
        </div>
      </div>

      {/* Timeframe Selectors */}
      <div className="flex gap-2">
        {(["daily", "weekly", "monthly", "yearly"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`rounded-full px-4 py-1.5 text-xs font-bold capitalize transition-all ${
              period === p
                ? "bg-rose text-white shadow-soft"
                : "border border-[#EFE4DB] bg-white text-[#5C4D44] hover:bg-[#FAF7F2]"
            }`}
          >
            {p} Sales
          </button>
        ))}
      </div>

      {/* Main Bar Chart */}
      <div className="rounded-3xl border border-[#EFE4DB] bg-white p-6 shadow-card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-display text-lg font-bold text-[#1A100C] capitalize">
              {period} Revenue Comparison
            </h3>
            <p className="text-xs text-[#8C7A70]">Financial performance tracked in Indian Rupees (₹)</p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activeChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2EBE5" />
              <XAxis dataKey="period" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#8C7A70" }} />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#8C7A70" }}
                tickFormatter={(val) => `₹${val / 1000}k`}
              />
              <Tooltip
                formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, "Sales Revenue"]}
                contentStyle={{
                  borderRadius: "16px",
                  border: "1px solid #EFE4DB",
                  boxShadow: "0 10px 25px -5px rgba(0,0,0,0.08)",
                }}
              />
              <Bar dataKey="sales" fill="#C93B57" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ================= MODAL 1: GROSS BAKERY SALES ================= */}
      {isGrossSalesModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsGrossSalesModalOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="w-full max-w-4xl rounded-3xl border border-[#EFE4DB] bg-white p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#EFE4DB] pb-4">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-rose/10 text-rose">
                  <IndianRupee className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-[#1A100C]">
                    Gross Bakery Sales Analytics ({currentPeriodMetrics.periodLabel})
                  </h3>
                  <p className="text-xs text-[#8C7A70]">
                    Detailed revenue summary, order contributions, and product performance breakdown
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsGrossSalesModalOpen(false)}
                className="rounded-full p-2 text-[#8C7A70] hover:bg-[#FAF7F2] hover:text-[#1A100C] transition-colors"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Top KPI Cards inside Modal */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
              <div className="rounded-2xl border border-[#EFE4DB] bg-[#FAF7F2] p-3.5 text-center">
                <p className="text-[0.68rem] font-bold uppercase tracking-wider text-[#8C7A70]">Total Gross Sales</p>
                <p className="mt-1 font-display text-xl font-bold text-emerald-700">{currentPeriodMetrics.grossSales}</p>
                <p className="text-[0.65rem] text-[#8C7A70]">{currentPeriodMetrics.periodLabel}</p>
              </div>

              <div className="rounded-2xl border border-[#EFE4DB] bg-[#FAF7F2] p-3.5 text-center">
                <p className="text-[0.68rem] font-bold uppercase tracking-wider text-[#8C7A70]">Period Growth</p>
                <p className="mt-1 font-display text-xl font-bold text-emerald-600">{currentPeriodMetrics.grossComparison}</p>
                <p className="text-[0.65rem] text-[#8C7A70]">Positive sales momentum</p>
              </div>

              <div className="rounded-2xl border border-[#EFE4DB] bg-[#FAF7F2] p-3.5 text-center">
                <p className="text-[0.68rem] font-bold uppercase tracking-wider text-[#8C7A70]">Completed Orders</p>
                <p className="mt-1 font-display text-xl font-bold text-[#1A100C]">{activeOrders.length} Orders</p>
                <p className="text-[0.65rem] text-[#8C7A70]">Contributing volume</p>
              </div>

              <div className="rounded-2xl border border-[#EFE4DB] bg-[#FAF7F2] p-3.5 text-center">
                <p className="text-[0.68rem] font-bold uppercase tracking-wider text-[#8C7A70]">Avg Ticket Size</p>
                <p className="mt-1 font-display text-xl font-bold text-rose">{currentPeriodMetrics.aov}</p>
                <p className="text-[0.65rem] text-[#8C7A70]">Per customer checkout</p>
              </div>
            </div>

            {/* Product Sales Breakdown */}
            <div className="rounded-2xl border border-[#EFE4DB] p-5 bg-[#FAF7F2] mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A100C] mb-3 flex items-center justify-between">
                <span>Product Sales Breakdown</span>
                <span className="text-[0.68rem] text-[#8C7A70] font-normal">Revenue generated by each artisan cake</span>
              </h4>
              <div className="space-y-3">
                {productSalesBreakdown.map((prod, idx) => {
                  const share = Math.round((prod.revenue / (currentPeriodMetrics.grossRaw || 1)) * 100);
                  return (
                    <div key={idx} className="rounded-xl border border-[#EFE4DB] bg-white p-3.5">
                      <div className="flex items-center justify-between text-xs font-bold text-[#1A100C] mb-1.5">
                        <span className="flex items-center gap-2">
                          <span className="grid h-5 w-5 place-items-center rounded-full bg-rose/10 text-rose text-[0.65rem] font-mono">
                            {idx + 1}
                          </span>
                          <span>{prod.name}</span>
                        </span>
                        <div className="text-right">
                          <span>{formatINR(prod.revenue)}</span>
                          <span className="text-[#8C7A70] text-[0.68rem] font-normal ml-2">({prod.quantity} sold • {share}%)</span>
                        </div>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-[#FAF7F2] overflow-hidden">
                        <div className="h-full rounded-full bg-rose transition-all duration-500" style={{ width: `${Math.max(8, share)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Contributing Orders Table */}
            <div className="rounded-2xl border border-[#EFE4DB] overflow-hidden bg-white shadow-sm mb-6">
              <div className="p-4 bg-[#FAF7F2] border-b border-[#EFE4DB]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A100C]">
                  Orders Contributing to {currentPeriodMetrics.periodLabel} Gross Sales
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[#EFE4DB] text-[#8C7A70] uppercase font-bold tracking-wider">
                    <tr>
                      <th className="py-2.5 px-4">Order ID</th>
                      <th className="py-2.5 px-4">Customer Name</th>
                      <th className="py-2.5 px-4">Order Date</th>
                      <th className="py-2.5 px-4">Product Name(s)</th>
                      <th className="py-2.5 px-4">Amount</th>
                      <th className="py-2.5 px-4 text-right">Payment Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F2EBE5]">
                    {activeOrders.map((o) => (
                      <tr key={o.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-rose">{o.id}</td>
                        <td className="py-3 px-4 font-semibold text-[#1A100C]">{o.customerName}</td>
                        <td className="py-3 px-4 text-[#8C7A70]">{formatDate(o.createdAt || o.deliveryDate)}</td>
                        <td className="py-3 px-4 text-[#5C4D44] font-medium">
                          {o.items.map((i) => `${i.productName} (x${i.quantity})`).join(", ")}
                        </td>
                        <td className="py-3 px-4 font-bold text-emerald-700">{formatINR(o.totalAmount)}</td>
                        <td className="py-3 px-4 text-right">
                          <span
                            className={`inline-block rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold uppercase ${
                              o.paymentStatus === "paid"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {o.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-[#EFE4DB] pt-4">
              <span className="text-xs text-[#8C7A70]">
                All metrics derived from live Firebase Firestore store orders
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsGrossSalesModalOpen(false)}
                className="text-xs font-semibold"
              >
                Close Sales Analytics
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: AVERAGE ORDER VALUE ================= */}
      {isAovModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAovModalOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="w-full max-w-4xl rounded-3xl border border-[#EFE4DB] bg-white p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#EFE4DB] pb-4">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-rose/10 text-rose">
                  <TrendingUp className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-[#1A100C]">
                    Average Order Value (AOV) Details
                  </h3>
                  <p className="text-xs text-[#8C7A70]">
                    Calculations, distribution of checkout sizes, and highest/lowest value orders
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAovModalOpen(false)}
                className="rounded-full p-2 text-[#8C7A70] hover:bg-[#FAF7F2] hover:text-[#1A100C] transition-colors"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Formula Banner */}
            <div className="rounded-2xl border border-rose/20 bg-rose/5 p-5 my-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose">
                    AOV Mathematical Formulation
                  </h4>
                  <p className="text-sm font-bold text-[#1A100C] mt-1 font-mono">
                    Average Order Value = Total Revenue ÷ Total Number of Orders
                  </p>
                  <p className="text-xs text-[#5C4D44] mt-0.5">
                    {currentPeriodMetrics.grossSales} ÷ {activeOrders.length} Orders ={" "}
                    <span className="font-bold text-rose">{currentPeriodMetrics.aov} per celebration</span>
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="rounded-full bg-white px-3 py-1 border border-[#EFE4DB] text-xs font-bold text-rose">
                    Current AOV: {currentPeriodMetrics.aov}
                  </span>
                </div>
              </div>
            </div>

            {/* KPI Cards inside Modal */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="rounded-2xl border border-[#EFE4DB] bg-[#FAF7F2] p-3.5 text-center">
                <p className="text-[0.68rem] font-bold uppercase tracking-wider text-[#8C7A70]">Average Ticket</p>
                <p className="mt-1 font-display text-xl font-bold text-rose">{currentPeriodMetrics.aov}</p>
                <p className="text-[0.65rem] text-[#8C7A70]">Mean basket size</p>
              </div>

              <div className="rounded-2xl border border-[#EFE4DB] bg-[#FAF7F2] p-3.5 text-center">
                <p className="text-[0.68rem] font-bold uppercase tracking-wider text-[#8C7A70]">Total Revenue</p>
                <p className="mt-1 font-display text-xl font-bold text-emerald-700">{currentPeriodMetrics.grossSales}</p>
                <p className="text-[0.65rem] text-[#8C7A70]">Aggregated intake</p>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-3.5 text-center">
                <p className="text-[0.68rem] font-bold uppercase tracking-wider text-emerald-800">Highest Order</p>
                <p className="mt-1 font-display text-xl font-bold text-emerald-700">
                  {formatINR(highestOrder?.totalAmount || 0)}
                </p>
                <p className="text-[0.65rem] text-emerald-600 font-semibold">{highestOrder?.id} ({highestOrder?.customerName})</p>
              </div>

              <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-3.5 text-center">
                <p className="text-[0.68rem] font-bold uppercase tracking-wider text-amber-800">Lowest Order</p>
                <p className="mt-1 font-display text-xl font-bold text-amber-700">
                  {formatINR(lowestOrder?.totalAmount || 0)}
                </p>
                <p className="text-[0.65rem] text-amber-600 font-semibold">{lowestOrder?.id} ({lowestOrder?.customerName})</p>
              </div>
            </div>

            {/* Individual Order Amounts Table */}
            <div className="rounded-2xl border border-[#EFE4DB] overflow-hidden bg-white shadow-sm mb-6">
              <div className="p-4 bg-[#FAF7F2] border-b border-[#EFE4DB] flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A100C]">
                  Individual Order Amount Breakdown & Variance
                </h4>
                <span className="text-[0.68rem] text-[#8C7A70]">Compared to average: {currentPeriodMetrics.aov}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[#EFE4DB] text-[#8C7A70] uppercase font-bold tracking-wider">
                    <tr>
                      <th className="py-2.5 px-4">Order ID</th>
                      <th className="py-2.5 px-4">Customer</th>
                      <th className="py-2.5 px-4">Artisan Cake(s)</th>
                      <th className="py-2.5 px-4">Order Amount</th>
                      <th className="py-2.5 px-4 text-right">Variance from AOV</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F2EBE5]">
                    {activeOrders.map((o) => {
                      const diff = o.totalAmount - (currentPeriodMetrics.aovRaw || avgOrderValue);
                      const isAbove = diff >= 0;
                      return (
                        <tr key={o.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-rose">{o.id}</td>
                          <td className="py-3 px-4 font-semibold text-[#1A100C]">{o.customerName}</td>
                          <td className="py-3 px-4 text-[#5C4D44]">
                            {o.items.map((i) => i.productName).join(", ")}
                          </td>
                          <td className="py-3 px-4 font-bold text-[#1A100C]">{formatINR(o.totalAmount)}</td>
                          <td className="py-3 px-4 text-right">
                            <span
                              className={`inline-block font-mono font-bold text-[0.72rem] ${
                                isAbove ? "text-emerald-600" : "text-amber-600"
                              }`}
                            >
                              {isAbove ? `+${formatINR(diff)}` : `-${formatINR(Math.abs(diff))}`}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-[#EFE4DB] pt-4">
              <span className="text-xs text-[#8C7A70]">
                Calculated for active {currentPeriodMetrics.periodLabel} from live customer orders
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAovModalOpen(false)}
                className="text-xs font-semibold"
              >
                Close AOV Details
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: TOTAL VOLUME ================= */}
      {isVolumeModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsVolumeModalOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="w-full max-w-4xl rounded-3xl border border-[#EFE4DB] bg-white p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#EFE4DB] pb-4">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-rose/10 text-rose">
                  <ShoppingBag className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-[#1A100C]">
                    Total Order Volume & Fulfillment Pipeline
                  </h3>
                  <p className="text-xs text-[#8C7A70]">
                    Status breakdown, delivery stages, and order inspection for {currentPeriodMetrics.periodLabel}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsVolumeModalOpen(false)}
                className="rounded-full p-2 text-[#8C7A70] hover:bg-[#FAF7F2] hover:text-[#1A100C] transition-colors"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Stage Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
              <div className="rounded-2xl border border-[#EFE4DB] bg-[#FAF7F2] p-3.5 text-center">
                <p className="text-[0.68rem] font-bold uppercase tracking-wider text-[#8C7A70]">Total Volume</p>
                <p className="mt-1 font-display text-xl font-bold text-[#1A100C]">{currentPeriodMetrics.volume}</p>
                <p className="text-[0.65rem] text-[#8C7A70]">All order channels</p>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-3.5 text-center">
                <p className="text-[0.68rem] font-bold uppercase tracking-wider text-emerald-800">Completed / Paid</p>
                <p className="mt-1 font-display text-xl font-bold text-emerald-700">{completedOrders.length} Orders</p>
                <p className="text-[0.65rem] text-emerald-600 font-semibold">Delivered & verified</p>
              </div>

              <div className="rounded-2xl border border-purple-100 bg-purple-50/50 p-3.5 text-center">
                <p className="text-[0.68rem] font-bold uppercase tracking-wider text-purple-800">In Preparation</p>
                <p className="mt-1 font-display text-xl font-bold text-purple-700">{preparingOrders.length} Orders</p>
                <p className="text-[0.65rem] text-purple-600 font-semibold">Baking & dispatching</p>
              </div>

              <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-3.5 text-center">
                <p className="text-[0.68rem] font-bold uppercase tracking-wider text-amber-800">Pending / New</p>
                <p className="mt-1 font-display text-xl font-bold text-amber-700">{pendingOrders.length} Orders</p>
                <p className="text-[0.65rem] text-amber-600 font-semibold">Incoming orders</p>
              </div>
            </div>

            {/* All Orders Table */}
            <div className="rounded-2xl border border-[#EFE4DB] overflow-hidden bg-white shadow-sm mb-6">
              <div className="p-4 bg-[#FAF7F2] border-b border-[#EFE4DB]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A100C]">
                  All Orders in {currentPeriodMetrics.periodLabel}
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[#EFE4DB] text-[#8C7A70] uppercase font-bold tracking-wider">
                    <tr>
                      <th className="py-2.5 px-4">Order ID</th>
                      <th className="py-2.5 px-4">Customer</th>
                      <th className="py-2.5 px-4">Delivery Date</th>
                      <th className="py-2.5 px-4">Amount</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F2EBE5]">
                    {activeOrders.map((o) => (
                      <tr key={o.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-rose">{o.id}</td>
                        <td className="py-3 px-4">
                          <p className="font-bold text-[#1A100C]">{o.customerName}</p>
                          <p className="text-[0.68rem] text-[#8C7A70]">{o.customerPhone}</p>
                        </td>
                        <td className="py-3 px-4 text-[#5C4D44]">{formatDate(o.deliveryDate)}</td>
                        <td className="py-3 px-4 font-bold text-[#1A100C]">{formatINR(o.totalAmount)}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold uppercase ${
                              o.status === "delivered"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : o.status === "preparing"
                                ? "bg-purple-50 text-purple-700 border border-purple-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {o.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedOrder(selectedOrder?.id === o.id ? null : o)}
                            className="text-[0.7rem] h-7 px-2 font-semibold"
                          >
                            {selectedOrder?.id === o.id ? "Hide Details" : "View Details"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Selected Order Detailed Drawer / Inspection */}
            {selectedOrder && (
              <div className="rounded-2xl border border-rose/30 bg-rose/5 p-5 mb-6 animate-in fade-in duration-150">
                <div className="flex items-start justify-between mb-3 border-b border-rose/20 pb-3">
                  <div>
                    <span className="text-[0.68rem] font-bold uppercase text-rose">Order Details Inspector</span>
                    <h4 className="font-display text-lg font-bold text-[#1A100C]">
                      {selectedOrder.id} • {selectedOrder.customerName}
                    </h4>
                  </div>
                  <button onClick={() => setSelectedOrder(null)} className="text-[#8C7A70] hover:text-[#1A100C]">✕</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-3">
                  <div>
                    <span className="text-[#8C7A70] block">Delivery Address:</span>
                    <span className="font-semibold text-[#1A100C]">{selectedOrder.deliveryAddress}</span>
                  </div>
                  <div>
                    <span className="text-[#8C7A70] block">Cake Message:</span>
                    <span className="font-semibold text-[#1A100C]">{selectedOrder.cakeMessage || "None"}</span>
                  </div>
                  <div>
                    <span className="text-[#8C7A70] block">Payment Method:</span>
                    <span className="font-semibold text-[#1A100C]">{selectedOrder.paymentMethod || "UPI"} ({selectedOrder.paymentStatus})</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-rose/15 text-xs">
                  <span className="text-[#8C7A70] font-bold block mb-1">Items in this order:</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedOrder.items.map((it) => (
                      <span key={it.id} className="rounded-lg bg-white px-2.5 py-1 border border-[#EFE4DB] font-semibold text-[#1A100C]">
                        {it.productName} (Qty: {it.quantity} • {formatINR(it.price)})
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-[#EFE4DB] pt-4">
              <span className="text-xs text-[#8C7A70]">
                Fulfillment data synced in real-time from bakery orders
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsVolumeModalOpen(false)}
                className="text-xs font-semibold"
              >
                Close Volume Panel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 4: CUSTOMER RETENTION ================= */}
      {isRetentionModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsRetentionModalOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="w-full max-w-4xl rounded-3xl border border-[#EFE4DB] bg-white p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#EFE4DB] pb-4">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-purple-100 text-purple-800">
                  <HeartHandshake className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-[#1A100C]">
                    Customer Retention & Loyalty Analytics
                  </h3>
                  <p className="text-xs text-[#8C7A70]">
                    Repeat purchase rates, patron loyalty, and customer lifetime value (LTV)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsRetentionModalOpen(false)}
                className="rounded-full p-2 text-[#8C7A70] hover:bg-[#FAF7F2] hover:text-[#1A100C] transition-colors"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Retention Overview Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
              <div className="rounded-2xl border border-[#EFE4DB] bg-[#FAF7F2] p-3.5 text-center">
                <p className="text-[0.68rem] font-bold uppercase tracking-wider text-[#8C7A70]">Retention Rate</p>
                <p className="mt-1 font-display text-xl font-bold text-purple-700">{currentPeriodMetrics.retention}</p>
                <p className="text-[0.65rem] text-[#8C7A70]">Repeat celebration rate</p>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-3.5 text-center">
                <p className="text-[0.68rem] font-bold uppercase tracking-wider text-emerald-800">Returning Patrons</p>
                <p className="mt-1 font-display text-xl font-bold text-emerald-700">{returningCustomers.length} Regulars</p>
                <p className="text-[0.65rem] text-emerald-600 font-semibold">&gt; 1 celebration order</p>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-3.5 text-center">
                <p className="text-[0.68rem] font-bold uppercase tracking-wider text-blue-800">New Customers</p>
                <p className="mt-1 font-display text-xl font-bold text-blue-700">{newCustomers.length} First-Time</p>
                <p className="text-[0.65rem] text-blue-600 font-semibold">Recently acquired</p>
              </div>

              <div className="rounded-2xl border border-[#EFE4DB] bg-[#FAF7F2] p-3.5 text-center">
                <p className="text-[0.68rem] font-bold uppercase tracking-wider text-[#8C7A70]">Avg Repeat Orders</p>
                <p className="mt-1 font-display text-xl font-bold text-[#1A100C]">3.5 Orders</p>
                <p className="text-[0.65rem] text-[#8C7A70]">Per loyal customer</p>
              </div>
            </div>

            {/* Customer Loyalty Directory Table */}
            <div className="rounded-2xl border border-[#EFE4DB] overflow-hidden bg-white shadow-sm mb-6">
              <div className="p-4 bg-[#FAF7F2] border-b border-[#EFE4DB] flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A100C]">
                  Customer Loyalty & Repeat Purchase Directory
                </h4>
                <span className="text-[0.68rem] text-[#8C7A70]">Registered customer purchase history</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[#EFE4DB] text-[#8C7A70] uppercase font-bold tracking-wider">
                    <tr>
                      <th className="py-2.5 px-4">Customer Name</th>
                      <th className="py-2.5 px-4">Location / Area</th>
                      <th className="py-2.5 px-4">Total Orders</th>
                      <th className="py-2.5 px-4">Lifetime Spend</th>
                      <th className="py-2.5 px-4">Last Order</th>
                      <th className="py-2.5 px-4 text-right">Loyalty Tier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F2EBE5]">
                    {customers.map((c) => {
                      const isVIP = c.totalOrders >= 4;
                      const isRepeat = c.totalOrders > 1;
                      return (
                        <tr key={c.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                          <td className="py-3 px-4">
                            <p className="font-bold text-[#1A100C]">{c.name}</p>
                            <p className="text-[0.68rem] text-[#8C7A70]">{c.phone}</p>
                          </td>
                          <td className="py-3 px-4 text-[#5C4D44]">
                            {c.address ? c.address.split(",")[0] : "Punnaikayal"}
                          </td>
                          <td className="py-3 px-4 font-bold text-[#1A100C]">{c.totalOrders} Orders</td>
                          <td className="py-3 px-4 font-bold text-emerald-700">{formatINR(c.totalSpent)}</td>
                          <td className="py-3 px-4 text-[#8C7A70]">{formatDate(c.lastOrderAt)}</td>
                          <td className="py-3 px-4 text-right">
                            {isVIP ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 text-purple-800 px-2.5 py-0.5 text-[0.65rem] font-bold">
                                <Sparkles className="h-3 w-3" /> VIP Patron
                              </span>
                            ) : isRepeat ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-[0.65rem] font-bold">
                                <UserCheck className="h-3 w-3" /> Repeat
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 text-blue-800 px-2.5 py-0.5 text-[0.65rem] font-bold">
                                <UserPlus className="h-3 w-3" /> New
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-[#EFE4DB] pt-4">
              <span className="text-xs text-[#8C7A70]">
                Retention metrics calculated from live customer profiles & orders
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsRetentionModalOpen(false)}
                className="text-xs font-semibold"
              >
                Close Retention View
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
