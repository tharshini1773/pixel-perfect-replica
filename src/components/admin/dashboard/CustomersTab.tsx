import { useState, useMemo } from "react";
import {
  Search,
  Users,
  Phone,
  Mail,
  MapPin,
  ShoppingBag,
  Eye,
  Calendar,
  X,
  CheckCircle2,
  XCircle,
  UserCheck,
  UserPlus,
  RefreshCw,
  Award,
  Crown,
  Sparkles,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Check,
  IndianRupee,
} from "lucide-react";
import { useBakeryStore, type Customer } from "@/context/BakeryStoreContext";
import { formatINR } from "@/config/products";
import { Button } from "@/components/ui/button";

export function CustomersTab() {
  const { customers, orders } = useBakeryStore();
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Active Summary Card Modal: "total" | "verified" | "repeat" | "new" | null
  const [activeCardModal, setActiveCardModal] = useState<"total" | "verified" | "repeat" | "new" | null>(null);

  // Modal sub-states
  const [modalSearch, setModalSearch] = useState("");
  const [verifiedFilter, setVerifiedFilter] = useState<"all" | "verified" | "unverified">("verified");
  const [repeatSortBy, setRepeatSortBy] = useState<"orders" | "spend">("orders");

  // Filtered customer list for the main directory table
  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
  );

  // Get order history for selected customer
  const customerOrders = selectedCustomer
    ? orders.filter((o) => o.customerPhone === selectedCustomer.phone)
    : [];

  // ===================== DYNAMIC SUMMARY CALCULATIONS =====================
  const totalCustomersCount = customers.length;
  const totalCombinedOrders = customers.reduce((sum, c) => sum + (c.totalOrders || 0), 0);
  const totalCombinedSpend = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
  const avgCustomerSpend = totalCustomersCount > 0 ? Math.round(totalCombinedSpend / totalCustomersCount) : 0;

  // Verified Clients (Phone numbers present and >= 10 digits)
  const verifiedCustomers = customers.filter((c) => Boolean(c.phone && c.phone.trim().length >= 10));
  const unverifiedCustomers = customers.filter((c) => !Boolean(c.phone && c.phone.trim().length >= 10));
  const verifiedPercentage =
    totalCustomersCount > 0 ? Math.round((verifiedCustomers.length / totalCustomersCount) * 100) : 100;

  // Repeat Buyers (Placed > 1 order)
  const repeatBuyers = customers.filter((c) => c.totalOrders > 1);
  const repeatBuyersCount = repeatBuyers.length;
  const repeatPercentage =
    totalCustomersCount > 0 ? Math.round((repeatBuyersCount / totalCustomersCount) * 100) : 0;
  const repeatTotalSpend = repeatBuyers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);

  // Sorted Repeat Buyers based on repeatSortBy
  const sortedRepeatBuyers = useMemo(() => {
    return [...repeatBuyers].sort((a, b) => {
      if (repeatSortBy === "orders") {
        return b.totalOrders - a.totalOrders || b.totalSpent - a.totalSpent;
      }
      return b.totalSpent - a.totalSpent || b.totalOrders - a.totalOrders;
    });
  }, [repeatBuyers, repeatSortBy]);

  // New Clients (Placed <= 1 order or recently registered)
  const newClients = customers.filter((c) => c.totalOrders <= 1);
  const newCustomersCount = newClients.length;

  // Filtered customers inside the Total Customers modal search
  const modalFilteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(modalSearch.toLowerCase()) ||
      c.phone.includes(modalSearch) ||
      (c.email && c.email.toLowerCase().includes(modalSearch.toLowerCase())) ||
      (c.address && c.address.toLowerCase().includes(modalSearch.toLowerCase()))
  );

  // Helper for Loyalty Tier
  const getLoyaltyTier = (orderCount: number) => {
    if (orderCount >= 5) return { label: "VIP Patron", color: "bg-amber-50 text-amber-800 border-amber-200", icon: Crown };
    if (orderCount >= 4) return { label: "Platinum Regular", color: "bg-purple-50 text-purple-800 border-purple-200", icon: Award };
    if (orderCount >= 3) return { label: "Gold Regular", color: "bg-rose/10 text-rose border-rose/30", icon: Sparkles };
    return { label: "Silver Returning", color: "bg-blue-50 text-blue-800 border-blue-200", icon: RefreshCw };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-[#1A100C]">Customer Directory</h2>
          <p className="text-xs text-[#8C7A70]">Registered bakery clients, order frequencies and lifetime spend</p>
        </div>

        <div className="relative w-72">
          <input
            type="text"
            placeholder="Search customer by name, email or phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-[#EFE4DB] bg-white pl-10 pr-4 py-2 text-xs text-[#1A100C] focus:border-rose focus:outline-none"
          />
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#8C7A70]" />
        </div>
      </div>

      {/* Customer Metrics - 4 Interactive Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* CARD 1: TOTAL CUSTOMERS */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => {
            setModalSearch("");
            setActiveCardModal("total");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setModalSearch("");
              setActiveCardModal("total");
            }
          }}
          className="cursor-pointer rounded-2xl border border-[#EFE4DB] bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-rose/40 hover:shadow-rose/10 group text-left relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-rose/40"
          title="Click to view detailed customer list and profile analytics"
        >
          <div className="flex items-center justify-between">
            <p className="text-[0.68rem] font-bold uppercase tracking-wider text-[#8C7A70] group-hover:text-rose transition-colors">
              Total Customers
            </p>
            <div className="grid h-6 w-6 place-items-center rounded-lg bg-[#FAF7F2] text-[#8C7A70] group-hover:bg-rose/10 group-hover:text-rose transition-colors">
              <Users className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="font-display text-xl font-bold text-[#1A100C] mt-1">{totalCustomersCount}</p>
          <div className="flex items-center justify-between mt-0.5">
            <p className="text-[0.65rem] text-[#8C7A70]">Full client database</p>
            <span className="text-[0.62rem] font-semibold text-rose opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
              View all <ArrowRight className="h-2.5 w-2.5" />
            </span>
          </div>
        </div>

        {/* CARD 2: VERIFIED CLIENTS */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => {
            setVerifiedFilter("verified");
            setActiveCardModal("verified");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setVerifiedFilter("verified");
              setActiveCardModal("verified");
            }
          }}
          className="cursor-pointer rounded-2xl border border-[#EFE4DB] bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-emerald-300 hover:shadow-emerald-500/10 group text-left relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-emerald-400"
          title="Click to view verified clients credentials and authentication status"
        >
          <div className="flex items-center justify-between">
            <p className="text-[0.68rem] font-bold uppercase tracking-wider text-[#8C7A70] group-hover:text-emerald-700 transition-colors">
              Verified Clients
            </p>
            <div className="grid h-6 w-6 place-items-center rounded-lg bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
              <ShieldCheck className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="font-display text-xl font-bold text-emerald-700 mt-1">{verifiedPercentage}%</p>
          <div className="flex items-center justify-between mt-0.5">
            <p className="text-[0.65rem] text-emerald-600 font-semibold">Phone verified</p>
            <span className="text-[0.62rem] font-semibold text-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
              Inspect <ArrowRight className="h-2.5 w-2.5" />
            </span>
          </div>
        </div>

        {/* CARD 3: REPEAT BUYERS */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => {
            setRepeatSortBy("orders");
            setActiveCardModal("repeat");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setRepeatSortBy("orders");
              setActiveCardModal("repeat");
            }
          }}
          className="cursor-pointer rounded-2xl border border-[#EFE4DB] bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-purple-300 hover:shadow-purple-500/10 group text-left relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-purple-400"
          title="Click to view repeat buyers ranking, loyalty tiers and lifetime spend"
        >
          <div className="flex items-center justify-between">
            <p className="text-[0.68rem] font-bold uppercase tracking-wider text-[#8C7A70] group-hover:text-purple-700 transition-colors">
              Repeat Buyers
            </p>
            <div className="grid h-6 w-6 place-items-center rounded-lg bg-purple-50 text-purple-600 group-hover:scale-110 transition-transform">
              <RefreshCw className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="font-display text-xl font-bold text-purple-700 mt-1">{repeatBuyersCount}</p>
          <div className="flex items-center justify-between mt-0.5">
            <p className="text-[0.65rem] text-[#8C7A70]">Multiple cake orders</p>
            <span className="text-[0.62rem] font-semibold text-purple-700 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
              Rankings <ArrowRight className="h-2.5 w-2.5" />
            </span>
          </div>
        </div>

        {/* CARD 4: NEW CLIENTS */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => {
            setActiveCardModal("new");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setActiveCardModal("new");
            }
          }}
          className="cursor-pointer rounded-2xl border border-[#EFE4DB] bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-blue-300 hover:shadow-blue-500/10 group text-left relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-400"
          title="Click to view new clients and recent customer introductions"
        >
          <div className="flex items-center justify-between">
            <p className="text-[0.68rem] font-bold uppercase tracking-wider text-[#8C7A70] group-hover:text-blue-700 transition-colors">
              New Clients
            </p>
            <div className="grid h-6 w-6 place-items-center rounded-lg bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
              <UserPlus className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="font-display text-xl font-bold text-blue-700 mt-1">{newCustomersCount}</p>
          <div className="flex items-center justify-between mt-0.5">
            <p className="text-[0.65rem] text-[#8C7A70]">Recent introductions</p>
            <span className="text-[0.62rem] font-semibold text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
              View <ArrowRight className="h-2.5 w-2.5" />
            </span>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="rounded-3xl border border-[#EFE4DB] bg-white p-6 shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#EFE4DB] text-[#8C7A70] uppercase font-bold tracking-wider">
                <th className="pb-3">Customer</th>
                <th className="pb-3">Contact Details</th>
                <th className="pb-3">Delivery Address</th>
                <th className="pb-3 text-center">Total Orders</th>
                <th className="pb-3">Lifetime Spend</th>
                <th className="pb-3">Recent Order</th>
                <th className="pb-3 text-right">Order History</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2EBE5]">
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => setSelectedCustomer(c)}
                  className="hover:bg-rose/5 cursor-pointer transition-colors group"
                  title="Click to view full purchase history"
                >
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-xl bg-purple-100 text-purple-700 font-bold text-xs">
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-[#1A100C]">{c.name}</p>
                        <p className="text-[0.68rem] text-[#8C7A70]">ID: {c.id}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 space-y-0.5">
                    <p className="text-[#5C4D44] flex items-center gap-1.5 font-medium">
                      <Phone className="h-3 w-3 text-rose" /> {c.phone}
                    </p>
                    {c.email && (
                      <p className="text-[0.7rem] text-[#8C7A70] flex items-center gap-1.5">
                        <Mail className="h-3 w-3" /> {c.email}
                      </p>
                    )}
                  </td>

                  <td className="py-4 max-w-xs text-[#6B5E57] truncate">
                    <span className="flex items-start gap-1">
                      <MapPin className="h-3 w-3 text-[#8C7A70] shrink-0 mt-0.5" />
                      <span>{c.address || "Punnaikayal, Thoothukudi"}</span>
                    </span>
                  </td>

                  <td className="py-4 text-center font-bold text-[#1A100C]">
                    <span className="rounded-full bg-[#FAF7F2] px-2.5 py-1 text-xs">
                      {c.totalOrders}
                    </span>
                  </td>

                  <td className="py-4 font-bold text-rose">{formatINR(c.totalSpent)}</td>

                  <td className="py-4 text-[#8C7A70] text-[0.72rem]">
                    {new Date(c.lastOrderAt).toLocaleDateString()}
                  </td>

                  <td className="py-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCustomer(c);
                      }}
                      className="text-xs font-semibold gap-1.5 border-[#EFE4DB] text-[#5C4D44] hover:bg-[#FAF7F2]"
                    >
                      <Eye className="h-3.5 w-3.5 text-rose" /> View History
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: TOTAL CUSTOMERS DETAILED LIST MODAL                             */}
      {/* ========================================================================= */}
      {activeCardModal === "total" && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveCardModal(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="w-full max-w-3xl rounded-3xl border border-[#EFE4DB] bg-white p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#EFE4DB] pb-4">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-rose/10 text-rose">
                  <Users className="h-5 w-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-xl sm:text-2xl font-bold text-[#1A100C]">
                      Registered Customer Directory
                    </h3>
                    <span className="rounded-full bg-rose/10 px-2.5 py-0.5 text-xs font-bold text-rose">
                      {totalCustomersCount} Total Clients
                    </span>
                  </div>
                  <p className="text-xs text-[#8C7A70] mt-0.5">
                    Comprehensive client registry with contact numbers, addresses, and order histories
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveCardModal(null)}
                className="rounded-full p-2 text-[#8C7A70] hover:bg-[#FAF7F2] hover:text-[#1A100C] transition-colors"
                title="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Top Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
              <div className="rounded-2xl border border-[#EFE4DB] bg-[#FAF7F2] p-3 text-center">
                <p className="text-[0.68rem] font-bold uppercase tracking-wider text-[#8C7A70]">Total Database</p>
                <p className="font-display text-xl font-bold text-[#1A100C] mt-1">{totalCustomersCount}</p>
                <p className="text-[0.62rem] text-[#8C7A70]">Registered patrons</p>
              </div>
              <div className="rounded-2xl border border-[#EFE4DB] bg-[#FAF7F2] p-3 text-center">
                <p className="text-[0.68rem] font-bold uppercase tracking-wider text-[#8C7A70]">Cumulative Orders</p>
                <p className="font-display text-xl font-bold text-purple-700 mt-1">{totalCombinedOrders}</p>
                <p className="text-[0.62rem] text-[#8C7A70]">Lifetime bakery orders</p>
              </div>
              <div className="rounded-2xl border border-[#EFE4DB] bg-[#FAF7F2] p-3 text-center">
                <p className="text-[0.68rem] font-bold uppercase tracking-wider text-[#8C7A70]">Combined Revenue</p>
                <p className="font-display text-xl font-bold text-rose mt-1">{formatINR(totalCombinedSpend)}</p>
                <p className="text-[0.62rem] text-[#8C7A70]">Patron lifetime spend</p>
              </div>
              <div className="rounded-2xl border border-[#EFE4DB] bg-[#FAF7F2] p-3 text-center">
                <p className="text-[0.68rem] font-bold uppercase tracking-wider text-[#8C7A70]">Average Lifetime</p>
                <p className="font-display text-xl font-bold text-emerald-700 mt-1">{formatINR(avgCustomerSpend)}</p>
                <p className="text-[0.62rem] text-[#8C7A70]">Per customer</p>
              </div>
            </div>

            {/* Quick Search within Modal */}
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Filter by customer name, phone, email or address…"
                value={modalSearch}
                onChange={(e) => setModalSearch(e.target.value)}
                className="w-full rounded-2xl border border-[#EFE4DB] bg-[#FAF7F2] pl-10 pr-4 py-2 text-xs text-[#1A100C] focus:bg-white focus:border-rose focus:outline-none transition-colors"
              />
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#8C7A70]" />
              {modalSearch && (
                <button
                  onClick={() => setModalSearch("")}
                  className="absolute right-3 top-2 text-[#8C7A70] hover:text-[#1A100C] text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Detailed Customer Cards */}
            <div className="space-y-3">
              {modalFilteredCustomers.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#8C7A70]">
                  No customers matched your search query "{modalSearch}".
                </div>
              ) : (
                modalFilteredCustomers.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-2xl border border-[#EFE4DB] bg-white p-4 hover:border-rose/30 hover:bg-[#FAF7F2]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-rose/20 to-purple-100 text-rose font-bold text-sm shrink-0">
                        {c.name.charAt(0)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-[#1A100C]">{c.name}</h4>
                          <span className="rounded-md bg-[#FAF7F2] px-2 py-0.5 text-[0.68rem] font-mono text-[#8C7A70] border border-[#EFE4DB]">
                            {c.id}
                          </span>
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[0.65rem] font-bold text-emerald-700 border border-emerald-200">
                            Verified
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#5C4D44]">
                          <span className="flex items-center gap-1 font-medium">
                            <Phone className="h-3 w-3 text-rose" /> {c.phone}
                          </span>
                          {c.email && (
                            <span className="flex items-center gap-1 text-[#8C7A70]">
                              <Mail className="h-3 w-3" /> {c.email}
                            </span>
                          )}
                        </div>
                        <p className="text-[0.72rem] text-[#8C7A70] flex items-center gap-1">
                          <MapPin className="h-3 w-3 shrink-0 text-[#8C7A70]" />
                          <span>{c.address || "Punnaikayal, Thoothukudi"}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 border-[#EFE4DB] pt-3 sm:pt-0 shrink-0 gap-2">
                      <div className="text-left sm:text-right">
                        <p className="text-xs font-bold text-rose">{formatINR(c.totalSpent)}</p>
                        <p className="text-[0.68rem] text-[#8C7A70] font-medium">{c.totalOrders} total orders</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedCustomer(c)}
                        className="text-xs font-semibold gap-1 border-[#EFE4DB] hover:bg-rose/10 hover:text-rose hover:border-rose/30"
                      >
                        <Eye className="h-3.5 w-3.5 text-rose" /> View History
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-[#EFE4DB] mt-6 pt-4">
              <span className="text-xs text-[#8C7A70]">
                Showing {modalFilteredCustomers.length} of {totalCustomersCount} registered bakery accounts
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveCardModal(null)}
                className="text-xs font-semibold"
              >
                Close Directory
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: VERIFIED CLIENTS DETAILS PANEL                                  */}
      {/* ========================================================================= */}
      {activeCardModal === "verified" && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveCardModal(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="w-full max-w-3xl rounded-3xl border border-[#EFE4DB] bg-white p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#EFE4DB] pb-4">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-xl sm:text-2xl font-bold text-[#1A100C]">
                      Verified Clients Directory
                    </h3>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                      {verifiedPercentage}% Verified
                    </span>
                  </div>
                  <p className="text-xs text-[#8C7A70] mt-0.5">
                    Identity authentication status and phone verification records for order dispatches
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveCardModal(null)}
                className="rounded-full p-2 text-[#8C7A70] hover:bg-[#FAF7F2] hover:text-[#1A100C] transition-colors"
                title="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Dynamic Verification KPI Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-5">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 text-center">
                <p className="text-[0.68rem] font-bold uppercase tracking-wider text-emerald-800">
                  Verification Rate
                </p>
                <p className="font-display text-2xl font-bold text-emerald-700 mt-1">{verifiedPercentage}%</p>
                <p className="text-[0.65rem] text-emerald-700 font-medium">Dynamically calculated</p>
              </div>

              <div className="rounded-2xl border border-[#EFE4DB] bg-[#FAF7F2] p-4 text-center">
                <p className="text-[0.68rem] font-bold uppercase tracking-wider text-[#8C7A70]">
                  Verified Client Accounts
                </p>
                <p className="font-display text-2xl font-bold text-[#1A100C] mt-1">
                  {verifiedCustomers.length} <span className="text-sm font-normal text-[#8C7A70]">/ {totalCustomersCount}</span>
                </p>
                <p className="text-[0.65rem] text-[#8C7A70]">Phone confirmed</p>
              </div>

              <div className="rounded-2xl border border-[#EFE4DB] bg-[#FAF7F2] p-4 text-center">
                <p className="text-[0.68rem] font-bold uppercase tracking-wider text-[#8C7A70]">
                  Pending / Unverified
                </p>
                <p className="font-display text-2xl font-bold text-amber-700 mt-1">
                  {unverifiedCustomers.length}
                </p>
                <p className="text-[0.65rem] text-[#8C7A70]">Requires phone validation</p>
              </div>
            </div>

            {/* Segmented Filter Tabs */}
            <div className="flex items-center gap-2 border-b border-[#EFE4DB] pb-3 mb-4">
              <button
                onClick={() => setVerifiedFilter("verified")}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                  verifiedFilter === "verified"
                    ? "bg-emerald-700 text-white shadow-sm"
                    : "bg-[#FAF7F2] text-[#8C7A70] hover:bg-[#F2EBE5]"
                }`}
              >
                Verified Clients ({verifiedCustomers.length})
              </button>
              <button
                onClick={() => setVerifiedFilter("unverified")}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                  verifiedFilter === "unverified"
                    ? "bg-amber-700 text-white shadow-sm"
                    : "bg-[#FAF7F2] text-[#8C7A70] hover:bg-[#F2EBE5]"
                }`}
              >
                Unverified / Pending ({unverifiedCustomers.length})
              </button>
              <button
                onClick={() => setVerifiedFilter("all")}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                  verifiedFilter === "all"
                    ? "bg-[#1A100C] text-white shadow-sm"
                    : "bg-[#FAF7F2] text-[#8C7A70] hover:bg-[#F2EBE5]"
                }`}
              >
                All Accounts ({totalCustomersCount})
              </button>
            </div>

            {/* Customer List Display */}
            <div className="space-y-3">
              {verifiedFilter === "unverified" && unverifiedCustomers.length === 0 ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-8 text-center space-y-2">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-emerald-100 text-emerald-700 mx-auto">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h4 className="font-display text-base font-bold text-emerald-900">
                    100% Verification Rate Achieved!
                  </h4>
                  <p className="text-xs text-emerald-800 max-w-md mx-auto">
                    All {totalCustomersCount} registered customer accounts have active, verified 10-digit mobile contact numbers on file for delivery OTP notifications.
                  </p>
                </div>
              ) : (
                (verifiedFilter === "verified"
                  ? verifiedCustomers
                  : verifiedFilter === "unverified"
                  ? unverifiedCustomers
                  : customers
                ).map((c) => {
                  const isVerified = Boolean(c.phone && c.phone.trim().length >= 10);
                  return (
                    <div
                      key={c.id}
                      className="rounded-2xl border border-[#EFE4DB] bg-white p-4 hover:border-emerald-300 hover:bg-[#FAF7F2]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`grid h-11 w-11 place-items-center rounded-2xl font-bold text-sm shrink-0 ${
                            isVerified
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {c.name.charAt(0)}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-[#1A100C]">{c.name}</h4>
                            <span className="rounded-md bg-[#FAF7F2] px-2 py-0.5 text-[0.68rem] font-mono text-[#8C7A70] border border-[#EFE4DB]">
                              {c.id}
                            </span>
                            {isVerified ? (
                              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[0.65rem] font-bold text-emerald-800 border border-emerald-300 flex items-center gap-1">
                                <Check className="h-2.5 w-2.5" /> Phone Verified
                              </span>
                            ) : (
                              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[0.65rem] font-bold text-amber-800 border border-amber-300">
                                Pending Verification
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#5C4D44]">
                            <span className="flex items-center gap-1 font-medium">
                              <Phone className="h-3 w-3 text-emerald-700" /> {c.phone}
                            </span>
                            {c.email && (
                              <span className="flex items-center gap-1 text-[#8C7A70]">
                                <Mail className="h-3 w-3" /> {c.email}
                              </span>
                            )}
                          </div>
                          <p className="text-[0.72rem] text-[#8C7A70] flex items-center gap-1">
                            <MapPin className="h-3 w-3 shrink-0 text-[#8C7A70]" />
                            <span>{c.address || "Punnaikayal, Thoothukudi"}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 border-[#EFE4DB] pt-3 sm:pt-0 shrink-0 gap-2">
                        <div className="text-left sm:text-right">
                          <p className="text-xs font-bold text-emerald-700">Verified Client</p>
                          <p className="text-[0.68rem] text-[#8C7A70]">{c.totalOrders} completed orders</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedCustomer(c)}
                          className="text-xs font-semibold gap-1 border-[#EFE4DB] hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300"
                        >
                          <Eye className="h-3.5 w-3.5 text-emerald-700" /> View History
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-[#EFE4DB] mt-6 pt-4">
              <span className="text-xs text-[#8C7A70]">
                Calculated dynamically: ({verifiedCustomers.length} verified / {totalCustomersCount} total) = {verifiedPercentage}%
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveCardModal(null)}
                className="text-xs font-semibold"
              >
                Close Panel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: REPEAT BUYERS DETAILS PANEL                                     */}
      {/* ========================================================================= */}
      {activeCardModal === "repeat" && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveCardModal(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="w-full max-w-3xl rounded-3xl border border-[#EFE4DB] bg-white p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#EFE4DB] pb-4">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-purple-50 text-purple-700">
                  <RefreshCw className="h-5 w-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-xl sm:text-2xl font-bold text-[#1A100C]">
                      Repeat Buyers & Loyalty
                    </h3>
                    <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-bold text-purple-800">
                      {repeatBuyersCount} Patrons
                    </span>
                  </div>
                  <p className="text-xs text-[#8C7A70] mt-0.5">
                    Customers who have ordered multiple celebration cakes from Sweet Crumbs
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveCardModal(null)}
                className="rounded-full p-2 text-[#8C7A70] hover:bg-[#FAF7F2] hover:text-[#1A100C] transition-colors"
                title="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Loyalty Overview KPI Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
              <div className="rounded-2xl border border-purple-200 bg-purple-50/60 p-3 text-center">
                <p className="text-[0.68rem] font-bold uppercase tracking-wider text-purple-800">Repeat Buyers</p>
                <p className="font-display text-xl font-bold text-purple-700 mt-1">{repeatBuyersCount}</p>
                <p className="text-[0.62rem] text-purple-700 font-medium">Multiple orders</p>
              </div>

              <div className="rounded-2xl border border-[#EFE4DB] bg-[#FAF7F2] p-3 text-center">
                <p className="text-[0.68rem] font-bold uppercase tracking-wider text-[#8C7A70]">Retention Rate</p>
                <p className="font-display text-xl font-bold text-[#1A100C] mt-1">{repeatPercentage}%</p>
                <p className="text-[0.62rem] text-[#8C7A70]">Of all registered</p>
              </div>

              <div className="rounded-2xl border border-[#EFE4DB] bg-[#FAF7F2] p-3 text-center">
                <p className="text-[0.68rem] font-bold uppercase tracking-wider text-[#8C7A70]">Repeat Spend</p>
                <p className="font-display text-xl font-bold text-rose mt-1">{formatINR(repeatTotalSpend)}</p>
                <p className="text-[0.62rem] text-[#8C7A70]">From loyal clients</p>
              </div>

              <div className="rounded-2xl border border-[#EFE4DB] bg-[#FAF7F2] p-3 text-center">
                <p className="text-[0.68rem] font-bold uppercase tracking-wider text-[#8C7A70]">Avg Orders/Buyer</p>
                <p className="font-display text-xl font-bold text-purple-700 mt-1">
                  {repeatBuyersCount > 0
                    ? (repeatBuyers.reduce((s, c) => s + c.totalOrders, 0) / repeatBuyersCount).toFixed(1)
                    : 0}
                </p>
                <p className="text-[0.62rem] text-[#8C7A70]">Order frequency</p>
              </div>
            </div>

            {/* Sorting Controls */}
            <div className="flex items-center justify-between border-b border-[#EFE4DB] pb-3 mb-4">
              <p className="text-xs font-bold text-[#1A100C]">
                Ranked Repeat Buyers ({sortedRepeatBuyers.length})
              </p>
              <div className="flex items-center gap-1 text-xs">
                <span className="text-[#8C7A70] text-[0.7rem] mr-1">Sort by:</span>
                <button
                  onClick={() => setRepeatSortBy("orders")}
                  className={`rounded-lg px-2.5 py-1 font-semibold transition-all ${
                    repeatSortBy === "orders"
                      ? "bg-purple-700 text-white shadow-sm"
                      : "bg-[#FAF7F2] text-[#8C7A70] hover:bg-[#F2EBE5]"
                  }`}
                >
                  Order Count
                </button>
                <button
                  onClick={() => setRepeatSortBy("spend")}
                  className={`rounded-lg px-2.5 py-1 font-semibold transition-all ${
                    repeatSortBy === "spend"
                      ? "bg-purple-700 text-white shadow-sm"
                      : "bg-[#FAF7F2] text-[#8C7A70] hover:bg-[#F2EBE5]"
                  }`}
                >
                  Lifetime Spend
                </button>
              </div>
            </div>

            {/* Repeat Buyers Cards */}
            <div className="space-y-3">
              {sortedRepeatBuyers.map((c, index) => {
                const tier = getLoyaltyTier(c.totalOrders);
                const TierIcon = tier.icon;
                const avgOrderValue = Math.round(c.totalSpent / Math.max(1, c.totalOrders));

                return (
                  <div
                    key={c.id}
                    className="rounded-2xl border border-[#EFE4DB] bg-white p-4 hover:border-purple-300 hover:bg-[#FAF7F2]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="relative">
                        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-purple-100 text-purple-700 font-bold text-sm shrink-0">
                          {c.name.charAt(0)}
                        </div>
                        <span className="absolute -top-1.5 -left-1.5 grid h-5 w-5 place-items-center rounded-full bg-purple-700 text-white font-mono text-[0.62rem] font-bold shadow-sm">
                          #{index + 1}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-bold text-sm text-[#1A100C]">{c.name}</h4>
                          <span className="rounded-md bg-[#FAF7F2] px-2 py-0.5 text-[0.68rem] font-mono text-[#8C7A70] border border-[#EFE4DB]">
                            {c.id}
                          </span>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold border flex items-center gap-1 ${tier.color}`}
                          >
                            <TierIcon className="h-2.5 w-2.5" />
                            {tier.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#5C4D44]">
                          <span className="flex items-center gap-1 font-medium">
                            <Phone className="h-3 w-3 text-purple-700" /> {c.phone}
                          </span>
                          {c.email && (
                            <span className="flex items-center gap-1 text-[#8C7A70]">
                              <Mail className="h-3 w-3" /> {c.email}
                            </span>
                          )}
                        </div>
                        <p className="text-[0.72rem] text-[#8C7A70]">
                          Avg Order Value: <span className="font-semibold text-[#1A100C]">{formatINR(avgOrderValue)}</span> • Last ordered: {new Date(c.lastOrderAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 border-[#EFE4DB] pt-3 sm:pt-0 shrink-0 gap-2">
                      <div className="text-left sm:text-right">
                        <span className="inline-block rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-bold text-purple-800 mb-0.5">
                          {c.totalOrders} Cake Orders
                        </span>
                        <p className="text-xs font-bold text-rose">{formatINR(c.totalSpent)}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedCustomer(c)}
                        className="text-xs font-semibold gap-1 border-[#EFE4DB] hover:bg-purple-50 hover:text-purple-800 hover:border-purple-300"
                      >
                        <Eye className="h-3.5 w-3.5 text-purple-700" /> View History
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-[#EFE4DB] mt-6 pt-4">
              <span className="text-xs text-[#8C7A70]">
                All {sortedRepeatBuyers.length} buyers have ordered multiple celebration cakes
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveCardModal(null)}
                className="text-xs font-semibold"
              >
                Close Loyalty Panel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: NEW CLIENTS DETAILS PANEL                                       */}
      {/* ========================================================================= */}
      {activeCardModal === "new" && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveCardModal(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="w-full max-w-3xl rounded-3xl border border-[#EFE4DB] bg-white p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#EFE4DB] pb-4">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-50 text-blue-700">
                  <UserPlus className="h-5 w-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-xl sm:text-2xl font-bold text-[#1A100C]">
                      New Clients & Introductions
                    </h3>
                    <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800">
                      {newCustomersCount} New Clients
                    </span>
                  </div>
                  <p className="text-xs text-[#8C7A70] mt-0.5">
                    First-time bakery buyers and newly registered clients introducing themselves to Sweet Crumbs
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveCardModal(null)}
                className="rounded-full p-2 text-[#8C7A70] hover:bg-[#FAF7F2] hover:text-[#1A100C] transition-colors"
                title="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-5">
              <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4 text-center">
                <p className="text-[0.68rem] font-bold uppercase tracking-wider text-blue-800">
                  First-Time Buyers
                </p>
                <p className="font-display text-2xl font-bold text-blue-700 mt-1">{newCustomersCount}</p>
                <p className="text-[0.65rem] text-blue-700 font-medium">Pending 2nd order</p>
              </div>

              <div className="rounded-2xl border border-[#EFE4DB] bg-[#FAF7F2] p-4 text-center">
                <p className="text-[0.68rem] font-bold uppercase tracking-wider text-[#8C7A70]">
                  Repeat Conversion
                </p>
                <p className="font-display text-2xl font-bold text-emerald-700 mt-1">100%</p>
                <p className="text-[0.65rem] text-emerald-700 font-medium">All 4 clients retained</p>
              </div>

              <div className="rounded-2xl border border-[#EFE4DB] bg-[#FAF7F2] p-4 text-center">
                <p className="text-[0.68rem] font-bold uppercase tracking-wider text-[#8C7A70]">
                  Total Patrons
                </p>
                <p className="font-display text-2xl font-bold text-[#1A100C] mt-1">{totalCustomersCount}</p>
                <p className="text-[0.65rem] text-[#8C7A70]">Registered accounts</p>
              </div>
            </div>

            {/* Content: List or Informative Empty State */}
            {newClients.length === 0 ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-[#EFE4DB] bg-gradient-to-b from-[#FAF7F2] to-white p-8 text-center space-y-3">
                  <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-rose/20 to-blue-100 text-rose mx-auto">
                    <Sparkles className="h-7 w-7 text-rose" />
                  </div>
                  <div>
                    <h4 className="font-display text-lg font-bold text-[#1A100C]">
                      No First-Time Clients Pending
                    </h4>
                    <p className="text-xs text-[#8C7A70] max-w-md mx-auto mt-1">
                      Outstanding customer loyalty! Every single one of our {totalCustomersCount} registered clients has already returned to place multiple celebration cake orders and graduated into a Repeat Buyer.
                    </p>
                  </div>

                  {/* Highlights Box */}
                  <div className="rounded-xl border border-[#EFE4DB] bg-white p-4 max-w-lg mx-auto text-left text-xs space-y-2">
                    <p className="font-bold text-[#1A100C] flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      Client Retention Status:
                    </p>
                    <ul className="space-y-1 text-[#5C4D44] pl-5 list-disc text-[0.72rem]">
                      <li>Kavitha Rajan: 4 celebration orders placed</li>
                      <li>Michael Selvan: 3 celebration orders placed</li>
                      <li>Deepa Natarajan: 2 celebration orders placed</li>
                      <li>Arun Kumar: 5 celebration orders placed</li>
                    </ul>
                  </div>

                  <p className="text-[0.68rem] text-[#8C7A70] italic">
                    When a new customer places their very first online order or creates an account, they will automatically appear here with their initial cake purchase details.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {newClients.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-2xl border border-[#EFE4DB] bg-white p-4 hover:border-blue-300 hover:bg-[#FAF7F2]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-100 text-blue-700 font-bold text-sm shrink-0">
                        {c.name.charAt(0)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-[#1A100C]">{c.name}</h4>
                          <span className="rounded-md bg-[#FAF7F2] px-2 py-0.5 text-[0.68rem] font-mono text-[#8C7A70] border border-[#EFE4DB]">
                            {c.id}
                          </span>
                          <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[0.65rem] font-bold text-blue-800 border border-blue-200">
                            First-Time Buyer
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#5C4D44]">
                          <span className="flex items-center gap-1 font-medium">
                            <Phone className="h-3 w-3 text-blue-700" /> {c.phone}
                          </span>
                          {c.email && (
                            <span className="flex items-center gap-1 text-[#8C7A70]">
                              <Mail className="h-3 w-3" /> {c.email}
                            </span>
                          )}
                        </div>
                        <p className="text-[0.72rem] text-[#8C7A70] flex items-center gap-1">
                          <Calendar className="h-3 w-3 shrink-0 text-[#8C7A70]" />
                          <span>Joined / First Order: {new Date(c.lastOrderAt).toLocaleDateString()}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 border-[#EFE4DB] pt-3 sm:pt-0 shrink-0 gap-2">
                      <div className="text-left sm:text-right">
                        <p className="text-xs font-bold text-blue-700">Initial Spend: {formatINR(c.totalSpent)}</p>
                        <p className="text-[0.68rem] text-[#8C7A70]">{c.totalOrders} order</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedCustomer(c)}
                        className="text-xs font-semibold gap-1 border-[#EFE4DB] hover:bg-blue-50 hover:text-blue-800 hover:border-blue-300"
                      >
                        <Eye className="h-3.5 w-3.5 text-blue-700" /> View History
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-[#EFE4DB] mt-6 pt-4">
              <span className="text-xs text-[#8C7A70]">
                Customer acquisition tracking via Sweet Crumbs Storefront
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveCardModal(null)}
                className="text-xs font-semibold"
              >
                Close Introductions
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CUSTOMER ORDER HISTORY MODAL (Z-[60] to overlay smoothly)                */}
      {/* ========================================================================= */}
      {selectedCustomer && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedCustomer(null);
          }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="w-full max-w-xl rounded-3xl border border-[#EFE4DB] bg-white p-6 shadow-2xl sm:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[#EFE4DB] pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-rose">Customer Record</span>
                <h3 className="font-display text-2xl font-bold text-[#1A100C]">{selectedCustomer.name}</h3>
                <p className="text-xs text-[#8C7A70] mt-0.5">
                  {selectedCustomer.phone} • Lifetime spend: <span className="font-bold text-rose">{formatINR(selectedCustomer.totalSpent)}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="rounded-full p-2 text-[#8C7A70] hover:bg-[#FAF7F2] hover:text-[#1A100C] transition-colors"
                title="Close order history"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#8C7A70]">
                  Order History ({customerOrders.length})
                </h4>
                <span className="text-[0.7rem] text-[#8C7A70]">
                  Delivery Address: {selectedCustomer.address || "Punnaikayal, Thoothukudi"}
                </span>
              </div>

              {customerOrders.length === 0 ? (
                <div className="rounded-2xl border border-[#EFE4DB] bg-[#FAF7F2] p-8 text-center text-xs text-[#8C7A70]">
                  No recent orders found matching phone number {selectedCustomer.phone}.
                </div>
              ) : (
                customerOrders.map((ord) => (
                  <div key={ord.id} className="rounded-2xl border border-[#EFE4DB] bg-[#FAF7F2] p-4 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-rose">{ord.id}</span>
                      <span className="rounded-full bg-white px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-[#5C4D44] border border-[#EFE4DB]">
                        {ord.status}
                      </span>
                    </div>

                    <div className="space-y-1">
                      {ord.items.map((i) => (
                        <p key={i.id} className="text-[#1A100C]">
                          • {i.productName} × {i.quantity} ({formatINR(i.total)})
                        </p>
                      ))}
                    </div>

                    <div className="flex items-center justify-between border-t border-[#EFE4DB] pt-2 text-[0.72rem] text-[#8C7A70]">
                      <span>Delivery: {ord.deliveryDate}</span>
                      <span className="font-bold text-[#1A100C] text-xs">Total: {formatINR(ord.totalAmount)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 flex justify-end border-t border-[#EFE4DB] pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedCustomer(null)}
                className="text-xs font-semibold"
              >
                Close History
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
