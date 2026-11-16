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
import { useBakeryStore } from "@/context/BakeryStoreContext";
import { formatINR } from "@/config/products";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ReportsTab() {
  const { orders, products, customers } = useBakeryStore();
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly" | "yearly">("monthly");

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

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-3xl border border-[#EFE4DB] bg-white p-5 shadow-card">
          <span className="text-xs font-bold uppercase tracking-wider text-[#8C7A70]">Gross Bakery Sales</span>
          <p className="font-display text-2xl font-bold text-[#1A100C] mt-2">{formatINR(totalRevenue)}</p>
          <p className="text-[0.7rem] text-emerald-600 font-bold mt-0.5">+22% vs previous period</p>
        </div>

        <div className="rounded-3xl border border-[#EFE4DB] bg-white p-5 shadow-card">
          <span className="text-xs font-bold uppercase tracking-wider text-[#8C7A70]">Average Order Value</span>
          <p className="font-display text-2xl font-bold text-rose mt-2">{formatINR(avgOrderValue)}</p>
          <p className="text-[0.7rem] text-[#8C7A70] mt-0.5">Per celebration order</p>
        </div>

        <div className="rounded-3xl border border-[#EFE4DB] bg-white p-5 shadow-card">
          <span className="text-xs font-bold uppercase tracking-wider text-[#8C7A70]">Total Volume</span>
          <p className="font-display text-2xl font-bold text-[#1A100C] mt-2">{orders.length} Orders</p>
          <p className="text-[0.7rem] text-[#8C7A70] mt-0.5">Online & counter orders</p>
        </div>

        <div className="rounded-3xl border border-[#EFE4DB] bg-white p-5 shadow-card">
          <span className="text-xs font-bold uppercase tracking-wider text-[#8C7A70]">Customer Retention</span>
          <p className="font-display text-2xl font-bold text-purple-600 mt-2">78%</p>
          <p className="text-[0.7rem] text-[#8C7A70] mt-0.5">Repeat customers in Punnaikayal</p>
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
    </div>
  );
}
