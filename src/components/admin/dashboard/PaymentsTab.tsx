import { useState } from "react";
import { CreditCard, IndianRupee, CheckCircle2, Clock, AlertCircle, Search, Filter } from "lucide-react";
import { useBakeryStore, type PaymentStatus } from "@/context/BakeryStoreContext";
import { formatINR } from "@/config/products";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function PaymentsTab() {
  const { payments, updatePaymentStatus } = useBakeryStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const totalPaymentsAmount = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingAmount = payments
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + p.amount, 0);

  const paidCount = payments.filter((p) => p.status === "paid").length;
  const pendingCount = payments.filter((p) => p.status === "pending").length;

  const filtered = payments.filter((p) => {
    const matchesSearch =
      p.orderId.toLowerCase().includes(search.toLowerCase()) ||
      p.customerName.toLowerCase().includes(search.toLowerCase()) ||
      (p.transactionRef && p.transactionRef.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (id: string, newStatus: PaymentStatus) => {
    await updatePaymentStatus(id, newStatus);
    toast.success(`Payment #${id} status changed to ${newStatus}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-[#1A100C]">Bakery Payment Settlements</h2>
          <p className="text-xs text-[#8C7A70]">Verify transaction references, UPI transfers and cash-on-delivery settlements</p>
        </div>

        <div className="relative w-72">
          <input
            type="text"
            placeholder="Search by order ID, customer or UPI ref…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-[#EFE4DB] bg-white pl-10 pr-4 py-2 text-xs text-[#1A100C] focus:border-rose focus:outline-none"
          />
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#8C7A70]" />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-3xl border border-[#EFE4DB] bg-white p-5 shadow-card">
          <span className="text-xs font-bold uppercase tracking-wider text-[#8C7A70]">Verified Revenue</span>
          <p className="font-display text-2xl font-bold text-emerald-600 mt-2">{formatINR(totalPaymentsAmount)}</p>
          <p className="text-[0.7rem] text-[#8C7A70] mt-0.5">{paidCount} cleared payments</p>
        </div>

        <div className="rounded-3xl border border-[#EFE4DB] bg-white p-5 shadow-card">
          <span className="text-xs font-bold uppercase tracking-wider text-[#8C7A70]">Pending Settlement</span>
          <p className="font-display text-2xl font-bold text-amber-600 mt-2">{formatINR(pendingAmount)}</p>
          <p className="text-[0.7rem] text-[#8C7A70] mt-0.5">{pendingCount} COD / pending orders</p>
        </div>

        <div className="rounded-3xl border border-[#EFE4DB] bg-white p-5 shadow-card">
          <span className="text-xs font-bold uppercase tracking-wider text-[#8C7A70]">Payment Modes</span>
          <p className="font-display text-2xl font-bold text-[#1A100C] mt-2">UPI & Cash</p>
          <p className="text-[0.7rem] text-[#8C7A70] mt-0.5">Google Pay, PhonePe, COD</p>
        </div>

        <div className="rounded-3xl border border-[#EFE4DB] bg-white p-5 shadow-card">
          <span className="text-xs font-bold uppercase tracking-wider text-[#8C7A70]">Gateway Status</span>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span className="text-sm font-bold text-[#1A100C]">Live & Secure</span>
          </div>
          <p className="text-[0.7rem] text-[#8C7A70] mt-0.5">Strict settlement verification</p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2">
        {["all", "paid", "pending", "failed"].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`rounded-full px-4 py-1.5 text-xs font-bold capitalize transition-all ${
              statusFilter === st
                ? "bg-rose text-white shadow-soft"
                : "border border-[#EFE4DB] bg-white text-[#5C4D44] hover:bg-[#FAF7F2]"
            }`}
          >
            {st} ({st === "all" ? payments.length : payments.filter((p) => p.status === st).length})
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-3xl border border-[#EFE4DB] bg-white p-6 shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#EFE4DB] text-[#8C7A70] uppercase font-bold tracking-wider">
                <th className="pb-3">Transaction ID</th>
                <th className="pb-3">Order ID</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Method</th>
                <th className="pb-3">Ref Code</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Verification Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2EBE5]">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                  <td className="py-4 font-mono font-bold text-[#5C4D44]">{p.id}</td>
                  <td className="py-4 font-mono font-bold text-rose">{p.orderId}</td>
                  <td className="py-4">
                    <p className="font-bold text-[#1A100C]">{p.customerName}</p>
                    <p className="text-[0.7rem] text-[#8C7A70]">{p.customerPhone}</p>
                  </td>
                  <td className="py-4 font-semibold text-[#1A100C]">{p.method}</td>
                  <td className="py-4 font-mono text-[0.7rem] text-[#8C7A70]">{p.transactionRef || "N/A"}</td>
                  <td className="py-4 font-bold text-[#1A100C]">{formatINR(p.amount)}</td>
                  <td className="py-4">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-[0.68rem] font-bold uppercase tracking-wider ${
                        p.status === "paid"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : p.status === "pending"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <select
                      value={p.status}
                      onChange={(e) => handleStatusChange(p.id, e.target.value as PaymentStatus)}
                      className="rounded-xl border border-[#EFE4DB] bg-white px-2.5 py-1 text-xs font-semibold focus:outline-none"
                    >
                      <option value="paid">Mark Paid (Verified)</option>
                      <option value="pending">Keep Pending</option>
                      <option value="failed">Mark Failed</option>
                      <option value="refunded">Mark Refunded</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
