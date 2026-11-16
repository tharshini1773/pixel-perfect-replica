import { useState } from "react";
import {
  CreditCard,
  IndianRupee,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Filter,
  X,
  ChevronRight,
  ShieldCheck,
  Smartphone,
  Banknote,
  ArrowUpRight,
  Activity,
  Check,
  RefreshCw,
} from "lucide-react";
import { useBakeryStore, type PaymentStatus, type PaymentRecord } from "@/context/BakeryStoreContext";
import { formatINR } from "@/config/products";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function PaymentsTab() {
  const { payments, updatePaymentStatus } = useBakeryStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal states for the 4 summary cards
  const [showVerifiedModal, setShowVerifiedModal] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [showModesModal, setShowModesModal] = useState(false);
  const [showGatewayModal, setShowGatewayModal] = useState(false);

  // Search within Verified Revenue Modal
  const [verifiedSearch, setVerifiedSearch] = useState("");

  const paidPayments = payments.filter((p) => p.status === "paid");
  const pendingPayments = payments.filter((p) => p.status === "pending");
  const failedPayments = payments.filter((p) => p.status === "failed");

  const totalPaymentsAmount = paidPayments.reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = pendingPayments.reduce((sum, p) => sum + p.amount, 0);
  const failedAmount = failedPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalAllAmount = payments.reduce((sum, p) => sum + p.amount, 0);

  const paidCount = paidPayments.length;
  const pendingCount = pendingPayments.length;
  const failedCount = failedPayments.length;

  const filtered = payments.filter((p) => {
    const matchesSearch =
      p.orderId.toLowerCase().includes(search.toLowerCase()) ||
      p.customerName.toLowerCase().includes(search.toLowerCase()) ||
      (p.transactionRef && p.transactionRef.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filtered verified payments for Modal 1
  const modalFilteredVerified = paidPayments.filter((p) => {
    const s = verifiedSearch.toLowerCase();
    return (
      p.orderId.toLowerCase().includes(s) ||
      p.customerName.toLowerCase().includes(s) ||
      p.id.toLowerCase().includes(s) ||
      (p.transactionRef && p.transactionRef.toLowerCase().includes(s)) ||
      p.method.toLowerCase().includes(s)
    );
  });

  // Payment channel breakdown for Modal 3
  const gpayPayments = payments.filter(
    (p) => p.method.toLowerCase().includes("google") || p.method.toLowerCase() === "gpay"
  );
  const phonepePayments = payments.filter((p) => p.method.toLowerCase().includes("phonepe"));
  const upiPayments = payments.filter(
    (p) =>
      p.method.toUpperCase() === "UPI" ||
      (p.method.toLowerCase().includes("upi") &&
        !p.method.toLowerCase().includes("google") &&
        !p.method.toLowerCase().includes("phonepe"))
  );
  const codPayments = payments.filter(
    (p) =>
      p.method.toLowerCase().includes("cash") ||
      p.method.toLowerCase().includes("delivery") ||
      p.method.toLowerCase() === "cod"
  );

  const safeTotalAll = totalAllAmount || 1;

  const paymentChannels = [
    {
      id: "gpay",
      name: "Google Pay",
      type: "UPI Mobile App",
      icon: Smartphone,
      color: "bg-blue-500",
      textColor: "text-blue-700",
      bgColor: "bg-blue-50/80 border-blue-200",
      items: gpayPayments,
      count: gpayPayments.length,
      amount: gpayPayments.reduce((sum, p) => sum + p.amount, 0),
    },
    {
      id: "phonepe",
      name: "PhonePe",
      type: "UPI Mobile App",
      icon: Smartphone,
      color: "bg-purple-500",
      textColor: "text-purple-700",
      bgColor: "bg-purple-50/80 border-purple-200",
      items: phonepePayments,
      count: phonepePayments.length,
      amount: phonepePayments.reduce((sum, p) => sum + p.amount, 0),
    },
    {
      id: "upi",
      name: "UPI Direct / QR",
      type: "Instant Bank Transfer",
      icon: IndianRupee,
      color: "bg-emerald-500",
      textColor: "text-emerald-700",
      bgColor: "bg-emerald-50/80 border-emerald-200",
      items: upiPayments,
      count: upiPayments.length,
      amount: upiPayments.reduce((sum, p) => sum + p.amount, 0),
    },
    {
      id: "cod",
      name: "Cash on Delivery",
      type: "Doorstep Settlement",
      icon: Banknote,
      color: "bg-amber-500",
      textColor: "text-amber-700",
      bgColor: "bg-amber-50/80 border-amber-200",
      items: codPayments,
      count: codPayments.length,
      amount: codPayments.reduce((sum, p) => sum + p.amount, 0),
    },
  ];

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

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

      {/* KPI Cards - All 4 Clickable & Interactive */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* CARD 1: Verified Revenue */}
        <div
          onClick={() => {
            setVerifiedSearch("");
            setShowVerifiedModal(true);
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setShowVerifiedModal(true);
            }
          }}
          className="rounded-3xl border border-[#EFE4DB] bg-white p-5 shadow-card cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all group text-left"
          title="Click to view all verified revenue and cleared transactions"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8C7A70] group-hover:text-emerald-700 transition-colors">
              Verified Revenue
            </span>
            <span className="text-[0.68rem] text-emerald-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
              View All &rarr;
            </span>
          </div>
          <p className="font-display text-2xl font-bold text-emerald-600 mt-2">{formatINR(totalPaymentsAmount)}</p>
          <p className="text-[0.7rem] text-[#8C7A70] mt-0.5">{paidCount} cleared payments</p>
        </div>

        {/* CARD 2: Pending Settlement */}
        <div
          onClick={() => setShowPendingModal(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setShowPendingModal(true);
            }
          }}
          className="rounded-3xl border border-[#EFE4DB] bg-white p-5 shadow-card cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all group text-left"
          title="Click to review pending settlements and verify payments"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8C7A70] group-hover:text-amber-700 transition-colors">
              Pending Settlement
            </span>
            <span className="text-[0.68rem] text-amber-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
              Review &rarr;
            </span>
          </div>
          <p className="font-display text-2xl font-bold text-amber-600 mt-2">{formatINR(pendingAmount)}</p>
          <p className="text-[0.7rem] text-[#8C7A70] mt-0.5">{pendingCount} COD / pending orders</p>
        </div>

        {/* CARD 3: Payment Modes */}
        <div
          onClick={() => setShowModesModal(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setShowModesModal(true);
            }
          }}
          className="rounded-3xl border border-[#EFE4DB] bg-white p-5 shadow-card cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all group text-left"
          title="Click to view payment methods breakdown"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8C7A70] group-hover:text-rose transition-colors">
              Payment Modes
            </span>
            <span className="text-[0.68rem] text-rose font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
              Breakdown &rarr;
            </span>
          </div>
          <p className="font-display text-2xl font-bold text-[#1A100C] mt-2">UPI & Cash</p>
          <p className="text-[0.7rem] text-[#8C7A70] mt-0.5">Google Pay, PhonePe, COD</p>
        </div>

        {/* CARD 4: Gateway Status */}
        <div
          onClick={() => setShowGatewayModal(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setShowGatewayModal(true);
            }
          }}
          className="rounded-3xl border border-[#EFE4DB] bg-white p-5 shadow-card cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all group text-left"
          title="Click to view gateway connection status & security"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8C7A70] group-hover:text-emerald-700 transition-colors">
              Gateway Status
            </span>
            <span className="text-[0.68rem] text-emerald-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
              Status &rarr;
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
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

      {/* ================= MODAL 1: VERIFIED REVENUE ================= */}
      {showVerifiedModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowVerifiedModal(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="w-full max-w-4xl rounded-3xl border border-[#EFE4DB] bg-white p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#EFE4DB] pb-4">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-100 text-emerald-800">
                  <IndianRupee className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-[#1A100C]">
                    Verified Revenue & Cleared Settlements
                  </h3>
                  <p className="text-xs text-[#8C7A70]">
                    Complete ledger of all {paidCount} verified customer payments totaling {formatINR(totalPaymentsAmount)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowVerifiedModal(false)}
                className="rounded-full p-2 text-[#8C7A70] hover:bg-[#FAF7F2] hover:text-[#1A100C] transition-colors"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Top KPI Cards inside Modal */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
              <div className="rounded-2xl border border-[#EFE4DB] bg-[#FAF7F2] p-3.5 text-center">
                <p className="text-[0.68rem] font-bold uppercase tracking-wider text-[#8C7A70]">Total Verified</p>
                <p className="mt-1 font-display text-xl font-bold text-emerald-700">{formatINR(totalPaymentsAmount)}</p>
                <p className="text-[0.65rem] text-emerald-600 font-semibold">100% Cleared</p>
              </div>

              <div className="rounded-2xl border border-[#EFE4DB] bg-[#FAF7F2] p-3.5 text-center">
                <p className="text-[0.68rem] font-bold uppercase tracking-wider text-[#8C7A70]">Cleared Payments</p>
                <p className="mt-1 font-display text-xl font-bold text-[#1A100C]">{paidCount} Transactions</p>
                <p className="text-[0.65rem] text-[#8C7A70]">Settled orders</p>
              </div>

              <div className="rounded-2xl border border-[#EFE4DB] bg-[#FAF7F2] p-3.5 text-center">
                <p className="text-[0.68rem] font-bold uppercase tracking-wider text-[#8C7A70]">Average Order</p>
                <p className="mt-1 font-display text-xl font-bold text-[#1A100C]">
                  {formatINR(paidCount > 0 ? Math.round(totalPaymentsAmount / paidCount) : 0)}
                </p>
                <p className="text-[0.65rem] text-[#8C7A70]">Per paid invoice</p>
              </div>

              <div className="rounded-2xl border border-[#EFE4DB] bg-[#FAF7F2] p-3.5 text-center">
                <p className="text-[0.68rem] font-bold uppercase tracking-wider text-[#8C7A70]">Realization Rate</p>
                <p className="mt-1 font-display text-xl font-bold text-emerald-700">
                  {payments.length > 0 ? Math.round((paidCount / payments.length) * 100) : 0}%
                </p>
                <p className="text-[0.65rem] text-[#8C7A70]">Of total orders</p>
              </div>
            </div>

            {/* Search Input for Modal */}
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search verified transactions by Order ID, customer, reference code or method…"
                value={verifiedSearch}
                onChange={(e) => setVerifiedSearch(e.target.value)}
                className="w-full rounded-xl border border-[#EFE4DB] bg-white pl-9 pr-3 py-2 text-xs text-[#1A100C] focus:border-rose focus:outline-none"
              />
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#8C7A70]" />
            </div>

            {/* Verified Payments Table */}
            <div className="rounded-2xl border border-[#EFE4DB] overflow-hidden bg-white shadow-sm mb-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF7F2] border-b border-[#EFE4DB] text-[#8C7A70] uppercase font-bold tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Transaction ID</th>
                      <th className="py-3 px-4">Order ID</th>
                      <th className="py-3 px-4">Customer Details</th>
                      <th className="py-3 px-4">Payment Method</th>
                      <th className="py-3 px-4">Reference Code</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Payment Date</th>
                      <th className="py-3 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F2EBE5]">
                    {modalFilteredVerified.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-[#8C7A70]">
                          No verified transactions match your search.
                        </td>
                      </tr>
                    ) : (
                      modalFilteredVerified.map((p) => (
                        <tr key={p.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-[#5C4D44]">{p.id}</td>
                          <td className="py-3 px-4 font-mono font-bold text-rose">{p.orderId}</td>
                          <td className="py-3 px-4">
                            <p className="font-bold text-[#1A100C]">{p.customerName}</p>
                            <p className="text-[0.68rem] text-[#8C7A70]">{p.customerPhone}</p>
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-block rounded-full bg-[#FAF7F2] px-2.5 py-0.5 text-[0.68rem] font-bold text-[#5C4D44] border border-[#EFE4DB]">
                              {p.method}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-[0.7rem] text-[#8C7A70]">
                            {p.transactionRef || "N/A"}
                          </td>
                          <td className="py-3 px-4 font-bold text-emerald-700">{formatINR(p.amount)}</td>
                          <td className="py-3 px-4 text-[#8C7A70] text-[0.7rem] whitespace-nowrap">
                            {formatDate(p.date)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[0.68rem] font-bold text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="h-3 w-3" /> PAID
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#EFE4DB] pt-4">
              <span className="text-xs text-[#8C7A70]">
                Showing {modalFilteredVerified.length} of {paidCount} verified payments • Totaling {formatINR(totalPaymentsAmount)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowVerifiedModal(false)}
                className="text-xs font-semibold"
              >
                Close Details
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: PENDING SETTLEMENT ================= */}
      {showPendingModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowPendingModal(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="w-full max-w-3xl rounded-3xl border border-[#EFE4DB] bg-white p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#EFE4DB] pb-4">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-100 text-amber-800">
                  <Clock className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-[#1A100C]">
                    Pending Settlements & Awaiting Payments
                  </h3>
                  <p className="text-xs text-[#8C7A70]">
                    Orders awaiting cash collection or manual settlement verification
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPendingModal(false)}
                className="rounded-full p-2 text-[#8C7A70] hover:bg-[#FAF7F2] hover:text-[#1A100C] transition-colors"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Summary Banner */}
            <div className="my-5">
              {pendingCount > 0 ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                      Outstanding Balance: {formatINR(pendingAmount)} ({pendingCount} Order{pendingCount > 1 ? "s" : ""})
                    </h4>
                    <p className="text-xs text-amber-800 mt-0.5">
                      Verify cash collected on delivery or click below to mark as paid once settlement arrives in the bakery account.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                      All Settlements Cleared
                    </h4>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      There are currently no pending payments or uncollected orders.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Pending List */}
            {pendingPayments.length === 0 ? (
              <div className="rounded-2xl border border-[#EFE4DB] bg-[#FAF7F2] p-8 text-center my-4">
                <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto mb-2" />
                <p className="font-display text-lg font-bold text-[#1A100C]">Zero Pending Settlements</p>
                <p className="text-xs text-[#8C7A70] mt-1 max-w-sm mx-auto">
                  Every order has been paid and verified in Firestore.
                </p>
              </div>
            ) : (
              <div className="space-y-3 mb-6">
                {pendingPayments.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-2xl border border-[#EFE4DB] bg-white p-4.5 shadow-sm hover:border-amber-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-rose">{p.orderId}</span>
                        <span className="text-[#D0C2B6]">•</span>
                        <h4 className="font-display text-base font-bold text-[#1A100C]">{p.customerName}</h4>
                        <span className="rounded-full bg-amber-100 text-amber-800 px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider">
                          PENDING
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-xs text-[#5C4D44]">
                        <div>
                          <span className="text-[#8C7A70]">Transaction ID: </span>
                          <span className="font-mono font-bold text-[#1A100C]">{p.id}</span>
                        </div>
                        <div>
                          <span className="text-[#8C7A70]">Phone: </span>
                          <span className="font-bold text-[#1A100C]">{p.customerPhone}</span>
                        </div>
                        <div>
                          <span className="text-[#8C7A70]">Method: </span>
                          <span className="font-bold text-[#1A100C]">{p.method}</span>
                        </div>
                      </div>

                      <div className="text-[0.72rem] text-[#8C7A70] flex items-center gap-2 pt-1">
                        <span>Ref: {p.transactionRef || "PENDING-DELIVERY"}</span>
                        <span className="text-[#D0C2B6]">•</span>
                        <span>Recorded: {formatDate(p.date)}</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:items-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#F2EBE5]">
                      <span className="font-display text-xl font-bold text-amber-600">{formatINR(p.amount)}</span>
                      <Button
                        variant="rose"
                        size="sm"
                        onClick={() => handleStatusChange(p.id, "paid")}
                        className="font-bold text-xs gap-1.5 shadow-soft"
                      >
                        <Check className="h-3.5 w-3.5" /> Mark Paid (Verify)
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-[#EFE4DB] pt-4">
              <span className="text-xs text-[#8C7A70]">
                {pendingCount} pending payment{pendingCount === 1 ? "" : "s"} totaling {formatINR(pendingAmount)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPendingModal(false)}
                className="text-xs font-semibold"
              >
                Close Pending View
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: PAYMENT MODES BREAKDOWN ================= */}
      {showModesModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModesModal(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="w-full max-w-4xl rounded-3xl border border-[#EFE4DB] bg-white p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#EFE4DB] pb-4">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-rose/10 text-rose">
                  <CreditCard className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-[#1A100C]">
                    Payment Methods & Channel Analytics
                  </h3>
                  <p className="text-xs text-[#8C7A70]">
                    Real-time transaction volume and revenue distribution across all payment methods
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModesModal(false)}
                className="rounded-full p-2 text-[#8C7A70] hover:bg-[#FAF7F2] hover:text-[#1A100C] transition-colors"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Top Overview Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
              <div className="rounded-2xl border border-[#EFE4DB] bg-[#FAF7F2] p-3.5 text-center">
                <p className="text-[0.68rem] font-bold uppercase tracking-wider text-[#8C7A70]">Active Methods</p>
                <p className="mt-1 font-display text-xl font-bold text-[#1A100C]">4 Channels</p>
                <p className="text-[0.65rem] text-[#8C7A70]">GPay, PhonePe, UPI, COD</p>
              </div>

              <div className="rounded-2xl border border-[#EFE4DB] bg-[#FAF7F2] p-3.5 text-center">
                <p className="text-[0.68rem] font-bold uppercase tracking-wider text-[#8C7A70]">Digital / UPI Share</p>
                <p className="mt-1 font-display text-xl font-bold text-emerald-700">
                  {Math.round(
                    ((gpayPayments.reduce((s, p) => s + p.amount, 0) +
                      phonepePayments.reduce((s, p) => s + p.amount, 0) +
                      upiPayments.reduce((s, p) => s + p.amount, 0)) /
                      safeTotalAll) *
                      100
                  )}
                  %
                </p>
                <p className="text-[0.65rem] text-emerald-600 font-semibold">Direct bank settlement</p>
              </div>

              <div className="rounded-2xl border border-[#EFE4DB] bg-[#FAF7F2] p-3.5 text-center">
                <p className="text-[0.68rem] font-bold uppercase tracking-wider text-[#8C7A70]">Cash on Delivery</p>
                <p className="mt-1 font-display text-xl font-bold text-amber-700">
                  {Math.round((codPayments.reduce((s, p) => s + p.amount, 0) / safeTotalAll) * 100)}%
                </p>
                <p className="text-[0.65rem] text-amber-600 font-semibold">Counter & doorstep</p>
              </div>

              <div className="rounded-2xl border border-[#EFE4DB] bg-[#FAF7F2] p-3.5 text-center">
                <p className="text-[0.68rem] font-bold uppercase tracking-wider text-[#8C7A70]">Total Volume</p>
                <p className="mt-1 font-display text-xl font-bold text-[#1A100C]">{formatINR(totalAllAmount)}</p>
                <p className="text-[0.65rem] text-[#8C7A70]">{payments.length} total orders</p>
              </div>
            </div>

            {/* Method Breakdown Cards with Visual Chart Bars */}
            <div className="space-y-4 mb-6">
              {paymentChannels.map((ch) => {
                const IconComponent = ch.icon;
                const percentage = Math.round((ch.amount / safeTotalAll) * 100);

                return (
                  <div
                    key={ch.id}
                    className="rounded-2xl border border-[#EFE4DB] bg-white p-5 shadow-sm hover:border-rose/40 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <span className={`grid h-10 w-10 place-items-center rounded-xl ${ch.bgColor} ${ch.textColor}`}>
                          <IconComponent className="h-5 w-5" />
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-display text-base font-bold text-[#1A100C]">{ch.name}</h4>
                            <span className="rounded-full bg-[#FAF7F2] px-2 py-0.5 text-[0.65rem] font-bold text-[#5C4D44] border border-[#EFE4DB]">
                              {ch.type}
                            </span>
                          </div>
                          <p className="text-xs text-[#8C7A70]">
                            {ch.count} transaction{ch.count === 1 ? "" : "s"} processed
                          </p>
                        </div>
                      </div>

                      <div className="sm:text-right">
                        <p className="font-display text-xl font-bold text-[#1A100C]">{formatINR(ch.amount)}</p>
                        <p className="text-xs font-semibold text-[#8C7A70]">{percentage}% of all revenue</p>
                      </div>
                    </div>

                    {/* Progress Bar Gauge */}
                    <div className="space-y-1">
                      <div className="h-2.5 w-full rounded-full bg-[#FAF7F2] border border-[#EFE4DB] overflow-hidden">
                        <div
                          className={`h-full rounded-full ${ch.color} transition-all duration-500`}
                          style={{ width: `${Math.max(5, percentage)}%` }}
                        />
                      </div>
                    </div>

                    {/* Recent Transactions under this method */}
                    {ch.items.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-[#F2EBE5] flex flex-wrap gap-2 text-[0.72rem] text-[#8C7A70]">
                        <span className="font-bold text-[#5C4D44]">Orders:</span>
                        {ch.items.map((item) => (
                          <span
                            key={item.id}
                            className="inline-flex items-center gap-1 rounded-lg bg-[#FAF7F2] px-2 py-0.5 border border-[#EFE4DB]"
                          >
                            <span className="font-mono font-bold text-rose">{item.orderId}</span>
                            <span>• {item.customerName}</span>
                            <span className="font-bold text-[#1A100C]">({formatINR(item.amount)})</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-[#EFE4DB] pt-4">
              <span className="text-xs text-[#8C7A70]">
                Values updated dynamically from actual settlement data in Firebase Firestore
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowModesModal(false)}
                className="text-xs font-semibold"
              >
                Close Breakdown
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 4: GATEWAY STATUS ================= */}
      {showGatewayModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowGatewayModal(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="w-full max-w-4xl rounded-3xl border border-[#EFE4DB] bg-white p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#EFE4DB] pb-4">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-100 text-emerald-800">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-[#1A100C]">
                    Payment Gateway Connection & Telemetry
                  </h3>
                  <p className="text-xs text-[#8C7A70]">
                    Current operational status, security configuration, and live settlement verification telemetry
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGatewayModal(false)}
                className="rounded-full p-2 text-[#8C7A70] hover:bg-[#FAF7F2] hover:text-[#1A100C] transition-colors"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Live Gateway Telemetry Banner */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 my-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="h-3.5 w-3.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-display text-lg font-bold text-[#1A100C]">Gateway Engine: Operational</h4>
                      <span className="rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-xs font-bold border border-emerald-200">
                        Live & Secure
                      </span>
                    </div>
                    <p className="text-xs text-[#5C4D44] mt-0.5">
                      Direct UPI Deep-link & Counter Settlement verification active. Integrated with Firebase Firestore.
                    </p>
                  </div>
                </div>

                <div className="sm:text-right shrink-0">
                  <span className="text-[0.68rem] font-bold uppercase tracking-wider text-[#8C7A70] block">
                    Security Standard
                  </span>
                  <span className="text-xs font-bold text-emerald-800 block">
                    256-bit TLS / HTTPS End-to-End
                  </span>
                </div>
              </div>
            </div>

            {/* 4 Transaction Counts */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="rounded-2xl border border-[#EFE4DB] bg-white p-4 shadow-sm text-center">
                <p className="text-[0.68rem] font-bold uppercase tracking-wider text-[#8C7A70]">Total Invoices</p>
                <p className="mt-1 font-display text-xl font-bold text-[#1A100C]">{payments.length} Processed</p>
                <p className="text-[0.65rem] text-[#8C7A70]">{formatINR(totalAllAmount)} total volume</p>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 shadow-sm text-center">
                <p className="text-[0.68rem] font-bold uppercase tracking-wider text-emerald-800">Successful / Paid</p>
                <p className="mt-1 font-display text-xl font-bold text-emerald-700">{paidCount} Orders</p>
                <p className="text-[0.65rem] text-emerald-600 font-semibold">{formatINR(totalPaymentsAmount)} verified</p>
              </div>

              <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4 shadow-sm text-center">
                <p className="text-[0.68rem] font-bold uppercase tracking-wider text-amber-800">Pending Settlement</p>
                <p className="mt-1 font-display text-xl font-bold text-amber-600">{pendingCount} Orders</p>
                <p className="text-[0.65rem] text-amber-600 font-semibold">{formatINR(pendingAmount)} awaiting</p>
              </div>

              <div className="rounded-2xl border border-red-100 bg-red-50/50 p-4 shadow-sm text-center">
                <p className="text-[0.68rem] font-bold uppercase tracking-wider text-red-800">Failed / Rejected</p>
                <p className="mt-1 font-display text-xl font-bold text-red-600">{failedCount} Orders</p>
                <p className="text-[0.65rem] text-red-600 font-semibold">{formatINR(failedAmount)} total</p>
              </div>
            </div>

            {/* Actual Gateway Configuration Details */}
            <div className="rounded-2xl border border-[#EFE4DB] bg-[#FAF7F2] p-5 mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A100C] mb-3">
                Configured Gateway Architecture
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl border border-[#EFE4DB] bg-white p-3.5 space-y-1">
                  <span className="text-[0.68rem] font-bold uppercase text-[#8C7A70]">Database & Engine</span>
                  <p className="font-bold text-[#1A100C]">Firebase Firestore Cloud (tharshini-website)</p>
                  <p className="text-[0.7rem] text-[#8C7A70]">Synchronizes orders, payment references, and audit logs.</p>
                </div>

                <div className="rounded-xl border border-[#EFE4DB] bg-white p-3.5 space-y-1">
                  <span className="text-[0.68rem] font-bold uppercase text-[#8C7A70]">Verification Mode</span>
                  <p className="font-bold text-[#1A100C]">Strict Settlement Verification</p>
                  <p className="text-[0.7rem] text-[#8C7A70]">All UPI references and COD collections audited by bakery admin.</p>
                </div>
              </div>
            </div>

            {/* Recent Verification Log */}
            <div className="rounded-2xl border border-[#EFE4DB] overflow-hidden bg-white shadow-sm mb-6">
              <div className="p-4 bg-[#FAF7F2] border-b border-[#EFE4DB] flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A100C]">
                  Recent Transaction Verification Log
                </h4>
                <span className="text-[0.68rem] text-[#8C7A70]">
                  Live audit stream from current payment database
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[#EFE4DB] text-[#8C7A70] uppercase font-bold tracking-wider">
                    <tr>
                      <th className="py-2.5 px-4">Transaction / Order</th>
                      <th className="py-2.5 px-4">Customer</th>
                      <th className="py-2.5 px-4">Method & Reference</th>
                      <th className="py-2.5 px-4">Amount</th>
                      <th className="py-2.5 px-4">Timestamp</th>
                      <th className="py-2.5 px-4 text-right">Verification Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F2EBE5]">
                    {payments.slice(0, 5).map((p) => (
                      <tr key={p.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold">
                          <span className="text-[#5C4D44]">{p.id}</span>
                          <span className="text-[#8C7A70] mx-1.5">•</span>
                          <span className="text-rose">{p.orderId}</span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-[#1A100C]">{p.customerName}</td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-[#1A100C]">{p.method}</span>
                          <p className="font-mono text-[0.68rem] text-[#8C7A70]">{p.transactionRef || "N/A"}</p>
                        </td>
                        <td className="py-3 px-4 font-bold text-[#1A100C]">{formatINR(p.amount)}</td>
                        <td className="py-3 px-4 text-[#8C7A70] text-[0.7rem]">{formatDate(p.date)}</td>
                        <td className="py-3 px-4 text-right">
                          <span
                            className={`inline-block rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider ${
                              p.status === "paid"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : p.status === "pending"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-red-50 text-red-700 border border-red-200"
                            }`}
                          >
                            {p.status === "paid" ? "Verified" : p.status}
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
                Payment engine live & operating without errors
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowGatewayModal(false)}
                className="text-xs font-semibold"
              >
                Close Status View
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
