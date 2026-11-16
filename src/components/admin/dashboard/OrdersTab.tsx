import { useState } from "react";
import {
  Search,
  Filter,
  ShoppingBag,
  Eye,
  CheckCircle2,
  Phone,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  Trash2,
  MessageCircle,
} from "lucide-react";
import { useBakeryStore, type Order, type OrderStatus, type PaymentStatus } from "@/context/BakeryStoreContext";
import { formatINR } from "@/config/products";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function OrdersTab({ initialStatus = "all" }: { initialStatus?: string }) {
  const { orders, updateOrderStatus, updateOrderPaymentStatus, deleteOrder } = useBakeryStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(initialStatus);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Sync if initial status changes from navigation
  useState(() => {
    if (initialStatus && initialStatus !== "all") {
      setStatusFilter(initialStatus);
    }
  });

  const statuses: { value: OrderStatus | "all"; label: string }[] = [
    { value: "all", label: "All Orders" },
    { value: "new", label: "New" },
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "preparing", label: "Preparing" },
    { value: "ready", label: "Ready for Pickup" },
    { value: "out-for-delivery", label: "Out for Delivery" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerPhone.includes(search);
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    await updateOrderStatus(orderId, newStatus);
    toast.success(`Order #${orderId} marked as ${newStatus.replace(/-/g, " ")}`);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
  };

  const handlePaymentStatusChange = async (orderId: string, newStatus: PaymentStatus) => {
    await updateOrderPaymentStatus(orderId, newStatus);
    toast.success(`Payment for #${orderId} updated to ${newStatus}`);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, paymentStatus: newStatus });
    }
  };

  const handleDelete = async (orderId: string) => {
    if (confirm(`Are you sure you want to delete order #${orderId}?`)) {
      await deleteOrder(orderId);
      toast.success(`Order #${orderId} removed`);
      if (selectedOrder?.id === orderId) setSelectedOrder(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-[#1A100C]">Customer Order Management</h2>
          <p className="text-xs text-[#8C7A70]">Track cake production, delivery dispatch and customer details</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search by ID, name or phone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-[#EFE4DB] bg-white pl-9 pr-4 py-2 text-xs text-[#1A100C] focus:border-rose focus:outline-none"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#8C7A70]" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {statuses.map((s) => (
          <button
            key={s.value}
            onClick={() => setStatusFilter(s.value)}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
              statusFilter === s.value
                ? "bg-rose text-white shadow-soft"
                : "border border-[#EFE4DB] bg-white text-[#5C4D44] hover:bg-[#FAF7F2]"
            }`}
          >
            {s.label}{" "}
            {s.value !== "all" && (
              <span className="ml-1 opacity-75">
                ({orders.filter((o) => o.status === s.value).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="rounded-3xl border border-[#EFE4DB] bg-white p-6 shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#EFE4DB] text-[#8C7A70] uppercase font-bold tracking-wider">
                <th className="pb-3">Order ID</th>
                <th className="pb-3">Customer Details</th>
                <th className="pb-3">Items & Quantities</th>
                <th className="pb-3">Delivery Date</th>
                <th className="pb-3">Amount & Payment</th>
                <th className="pb-3">Order Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2EBE5]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-[#8C7A70]">
                    No orders matching your criteria found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                    <td
                      onClick={() => setSelectedOrder(ord)}
                      className="py-4 font-mono font-bold text-rose cursor-pointer hover:underline"
                    >
                      {ord.id}
                      <p className="text-[0.68rem] text-[#8C7A70] font-normal">
                        {new Date(ord.createdAt).toLocaleDateString()}
                      </p>
                    </td>

                    <td
                      onClick={() => setSelectedOrder(ord)}
                      className="py-4 cursor-pointer"
                    >
                      <p className="font-bold text-[#1A100C] hover:text-rose transition-colors">{ord.customerName}</p>
                      <p className="text-[0.72rem] text-[#8C7A70] flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {ord.customerPhone}
                      </p>
                    </td>

                    <td className="py-4 max-w-xs">
                      {ord.items.map((i) => (
                        <p key={i.id} className="font-medium text-[#1A100C] truncate">
                          • {i.productName} <span className="text-[#8C7A70] font-normal">(x{i.quantity})</span>
                        </p>
                      ))}
                      {ord.cakeMessage && (
                        <p className="text-[0.7rem] text-rose italic truncate mt-0.5">
                          "{ord.cakeMessage}"
                        </p>
                      )}
                    </td>

                    <td className="py-4 text-[#5C4D44]">
                      <div className="flex items-center gap-1.5 font-semibold">
                        <Calendar className="h-3.5 w-3.5 text-rose" />
                        <span>{ord.deliveryDate}</span>
                      </div>
                    </td>

                    <td className="py-4">
                      <p className="font-bold text-[#1A100C]">{formatINR(ord.totalAmount)}</p>
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[0.65rem] font-bold uppercase ${
                          ord.paymentStatus === "paid"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {ord.paymentStatus}
                      </span>
                    </td>

                    <td className="py-4">
                      <select
                        value={ord.status}
                        onChange={(e) => handleStatusChange(ord.id, e.target.value as OrderStatus)}
                        className={`rounded-xl border px-3 py-1.5 text-xs font-bold uppercase tracking-wider focus:outline-none ${getStatusBadge(
                          ord.status
                        )}`}
                      >
                        <option value="new">New</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="preparing">Preparing</option>
                        <option value="ready">Ready for Pickup</option>
                        <option value="out-for-delivery">Out for Delivery</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>

                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedOrder(ord)}
                          className="h-8 w-8 p-0 text-[#8C7A70] hover:text-rose hover:bg-rose/10 rounded-lg"
                          title="View order details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(ord.id)}
                          className="h-8 w-8 p-0 text-[#8C7A70] hover:text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete order"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl border border-[#EFE4DB] bg-white p-6 shadow-2xl sm:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[#EFE4DB] pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-rose">Order Details</span>
                <h3 className="font-display text-2xl font-bold text-[#1A100C]">#{selectedOrder.id}</h3>
                <p className="text-xs text-[#8C7A70]">Placed on {new Date(selectedOrder.createdAt).toLocaleString()}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-full p-2 text-[#8C7A70] hover:bg-[#FAF7F2] hover:text-[#1A100C]"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 space-y-6">
              {/* Customer Info */}
              <div className="rounded-2xl border border-[#EFE4DB] bg-[#FAF7F2] p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#8C7A70] mb-2">Customer & Delivery</h4>
                <p className="font-bold text-[#1A100C] text-sm">{selectedOrder.customerName}</p>
                <p className="text-xs text-[#5C4D44] mt-0.5">Phone: {selectedOrder.customerPhone}</p>
                {selectedOrder.customerEmail && (
                  <p className="text-xs text-[#5C4D44]">Email: {selectedOrder.customerEmail}</p>
                )}
                <p className="text-xs text-[#5C4D44] mt-2 flex items-start gap-1">
                  <MapPin className="h-3.5 w-3.5 text-rose shrink-0 mt-0.5" />
                  <span>{selectedOrder.deliveryAddress || "Shop Pickup"}</span>
                </p>
                <div className="mt-3 flex gap-2">
                  <a
                    href={`tel:${selectedOrder.customerPhone}`}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-rose/30 bg-white px-3 py-1.5 text-xs font-bold text-rose hover:bg-rose/10"
                  >
                    <Phone className="h-3.5 w-3.5" /> Call Customer
                  </a>
                  <a
                    href={`https://wa.me/91${selectedOrder.customerPhone}?text=Hello%20${encodeURIComponent(selectedOrder.customerName)}!%20Regarding%20your%20cake%20order%20%23${selectedOrder.id}%20from%20Sweet%20Crumbs%20Bakery...`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-white px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-50"
                  >
                    <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                  </a>
                </div>
              </div>

              {/* Items List */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#8C7A70] mb-3">Ordered Cakes</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center rounded-xl border border-[#EFE4DB] p-3 text-xs">
                      <div>
                        <p className="font-bold text-[#1A100C]">{item.productName}</p>
                        <p className="text-[#8C7A70]">Quantity: {item.quantity} × {formatINR(item.price)}</p>
                      </div>
                      <p className="font-bold text-rose">{formatINR(item.total)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customization Details */}
              {(selectedOrder.cakeMessage || selectedOrder.notes) && (
                <div className="rounded-2xl border border-dashed border-rose/30 bg-rose/5 p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose mb-1.5">Special Customization</h4>
                  {selectedOrder.cakeMessage && (
                    <p className="text-xs text-[#1A100C]">
                      <strong>Message on Cake:</strong> "{selectedOrder.cakeMessage}"
                    </p>
                  )}
                  {selectedOrder.notes && (
                    <p className="text-xs text-[#5C4D44] mt-1">
                      <strong>Baker Notes:</strong> {selectedOrder.notes}
                    </p>
                  )}
                </div>
              )}

              {/* Update Status Actions */}
              <div className="grid grid-cols-2 gap-4 border-t border-[#EFE4DB] pt-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8C7A70] mb-1">
                    Update Order Status
                  </label>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value as OrderStatus)}
                    className="w-full rounded-xl border border-[#EFE4DB] p-2 text-xs font-bold"
                  >
                    <option value="new">New</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="preparing">Preparing</option>
                    <option value="ready">Ready for Pickup</option>
                    <option value="out-for-delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8C7A70] mb-1">
                    Payment Status
                  </label>
                  <select
                    value={selectedOrder.paymentStatus}
                    onChange={(e) => handlePaymentStatusChange(selectedOrder.id, e.target.value as PaymentStatus)}
                    className="w-full rounded-xl border border-[#EFE4DB] p-2 text-xs font-bold"
                  >
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
