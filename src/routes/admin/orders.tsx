import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Search,
  Filter,
  Eye,
  MessageCircle,
  Phone,
  Calendar,
  Clock,
  Sparkles,
  ShoppingBag,
  CheckCircle,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useBakeryStore, type Order, type OrderStatus } from "@/context/BakeryStoreContext";
import { formatINR } from "@/config/products";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/admin/orders")({
  head: () => ({
    meta: pageMeta(
      "Order Management — Sweet Crumbs Bakery Admin",
      "Process customer cake orders, track baking progress, and update fulfillment status.",
    ),
  }),
  component: AdminOrdersPage,
});

const statuses: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all", label: "All Orders" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "preparing", label: "Preparing in Oven" },
  { value: "ready", label: "Ready for Pickup" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

function AdminOrdersPage() {
  const { orders, updateOrderStatus, deleteOrder } = useBakeryStore();

  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "all">("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const getStatusBadge = (status: OrderStatus) => {
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

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    await updateOrderStatus(orderId, newStatus);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
    toast.success(`Order ${orderId} marked as ${newStatus}!`);
  };

  const handleDelete = async (orderId: string) => {
    if (window.confirm(`Permanently remove order ${orderId}?`)) {
      await deleteOrder(orderId);
      if (selectedOrder?.id === orderId) setSelectedOrder(null);
      toast.info(`Order ${orderId} deleted.`);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = selectedStatus === "all" || o.status === selectedStatus;
    const matchesSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerPhone.includes(search) ||
      (o.cakeMessage && o.cakeMessage.toLowerCase().includes(search.toLowerCase())) ||
      o.items.some((it) => it.productName.toLowerCase().includes(search.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <AdminLayout
      title="Order Management"
      subtitle="Track live cake orders, communicate with customers, and update fulfillment milestones."
    >
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-[#8C7A70]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order ID, customer name, phone number, cake item…"
            className="w-full rounded-2xl border border-[#EFE4DB] bg-white pl-10 pr-4 py-2.5 text-xs text-[#1A100C] placeholder:text-[#A8988E] focus:border-rose focus:outline-none focus:ring-2 focus:ring-rose/20"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {statuses.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setSelectedStatus(s.value)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                selectedStatus === s.value
                  ? "bg-rose text-white shadow-soft"
                  : "bg-white border border-[#EFE4DB] text-[#5C4D44] hover:border-rose/30"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-hidden rounded-3xl border border-[#EFE4DB] bg-white shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F2] text-[0.7rem] uppercase tracking-wider text-[#8C7A70]">
              <tr>
                <th className="px-6 py-4 font-bold">Order ID</th>
                <th className="px-6 py-4 font-bold">Customer Details</th>
                <th className="px-6 py-4 font-bold">Items & Customization</th>
                <th className="px-6 py-4 font-bold">Required Delivery</th>
                <th className="px-6 py-4 font-bold">Amount</th>
                <th className="px-6 py-4 font-bold">Fulfillment Status</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE4DB]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[#8C7A70]">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.id} className="transition-colors hover:bg-[#FAF7F2]/60">
                    <td className="px-6 py-4 font-mono font-bold text-[#1A100C]">
                      {ord.id}
                      <span className="block text-[0.65rem] text-[#8C7A70] font-sans font-normal mt-0.5">
                        {new Date(ord.createdAt).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-[#1A100C] text-sm">{ord.customerName}</p>
                      <a
                        href={`tel:${ord.customerPhone}`}
                        className="text-xs text-rose font-medium hover:underline inline-flex items-center gap-1 mt-0.5"
                      >
                        <Phone className="h-3 w-3" /> {ord.customerPhone}
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {ord.items.map((it, idx) => (
                          <p key={idx} className="font-medium text-[#1A100C]">
                            {it.quantity}x {it.productName}
                          </p>
                        ))}
                        {ord.cakeMessage && (
                          <p className="text-[0.68rem] italic text-rose font-medium">
                            Message: "{ord.cakeMessage}"
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#5C4D44] font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-[#8C7A70]" />
                        <span>{ord.deliveryDate || "Urgent / ASAP"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-display font-bold text-sm text-[#1A100C]">
                      {formatINR(ord.totalAmount)}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={ord.status}
                        onChange={(e) => handleStatusChange(ord.id, e.target.value as OrderStatus)}
                        className={`rounded-full border px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider focus:outline-none cursor-pointer ${getStatusBadge(
                          ord.status,
                        )}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="preparing">Preparing</option>
                        <option value="ready">Ready for Pickup</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedOrder(ord)}
                          className="h-8 w-8 p-0 text-[#5C4D44] hover:text-rose"
                          aria-label="View order details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          asChild
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-emerald-600 hover:bg-emerald-50"
                          aria-label="Message customer on WhatsApp"
                        >
                          <a
                            href={`https://wa.me/91${ord.customerPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                              `Hello ${ord.customerName}, regarding your Sweet Crumbs Bakery order ${ord.id}: `,
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <MessageCircle className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(ord.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                          aria-label="Delete order"
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

      {/* Order Details Drawer / Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-xl bg-white border-[#EFE4DB] rounded-3xl p-6 sm:p-8">
          {selectedOrder && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-rose">{selectedOrder.id}</span>
                  <span
                    className={`rounded-full border px-3 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider ${getStatusBadge(
                      selectedOrder.status,
                    )}`}
                  >
                    {selectedOrder.status}
                  </span>
                </div>
                <DialogTitle className="font-display text-2xl font-bold text-[#1A100C]">
                  Order Specification
                </DialogTitle>
                <DialogDescription className="text-xs text-[#6B5E57]">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString("en-IN")}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-6 space-y-6">
                {/* Customer Information Card */}
                <div className="rounded-2xl border border-[#EFE4DB] bg-[#FAF7F2] p-4 space-y-2">
                  <span className="text-[0.68rem] font-bold uppercase tracking-wider text-[#8C7A70]">
                    Customer Details
                  </span>
                  <p className="font-display text-base font-bold text-[#1A100C]">
                    {selectedOrder.customerName}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#5C4D44]">
                    <a
                      href={`tel:${selectedOrder.customerPhone}`}
                      className="inline-flex items-center gap-1.5 text-rose font-bold hover:underline"
                    >
                      <Phone className="h-3.5 w-3.5" /> {selectedOrder.customerPhone}
                    </a>
                    {selectedOrder.customerEmail && (
                      <span>{selectedOrder.customerEmail}</span>
                    )}
                  </div>
                </div>

                {/* Ordered Items */}
                <div>
                  <span className="text-[0.68rem] font-bold uppercase tracking-wider text-[#8C7A70]">
                    Ordered Items
                  </span>
                  <div className="mt-2 divide-y divide-[#EFE4DB] rounded-2xl border border-[#EFE4DB]">
                    {selectedOrder.items.map((it, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3.5 text-xs">
                        <div>
                          <p className="font-bold text-[#1A100C]">{it.productName}</p>
                          <p className="text-[#8C7A70]">
                            {it.quantity} unit(s) × {formatINR(it.price)}
                          </p>
                        </div>
                        <span className="font-display font-bold text-[#1A100C]">
                          {formatINR(it.total)}
                        </span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between bg-[#FAF7F2] p-3.5 text-sm font-bold">
                      <span>Total Amount</span>
                      <span className="font-display text-base text-rose">
                        {formatINR(selectedOrder.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Customizations */}
                {(selectedOrder.cakeMessage || selectedOrder.notes || selectedOrder.deliveryDate) && (
                  <div className="rounded-2xl border border-[#EFE4DB] p-4 space-y-3">
                    <span className="text-[0.68rem] font-bold uppercase tracking-wider text-[#8C7A70]">
                      Preparation Notes
                    </span>
                    {selectedOrder.deliveryDate && (
                      <div className="text-xs">
                        <strong className="text-[#5C4D44]">Requested Delivery Date:</strong>{" "}
                        <span className="text-[#1A100C] font-semibold">{selectedOrder.deliveryDate}</span>
                      </div>
                    )}
                    {selectedOrder.cakeMessage && (
                      <div className="text-xs">
                        <strong className="text-[#5C4D44]">Message on Cake:</strong>{" "}
                        <span className="text-rose font-serif italic">"{selectedOrder.cakeMessage}"</span>
                      </div>
                    )}
                    {selectedOrder.notes && (
                      <div className="text-xs">
                        <strong className="text-[#5C4D44]">Customer Instructions:</strong>{" "}
                        <p className="mt-1 text-[#1A100C] bg-[#FAF7F2] p-2.5 rounded-xl">{selectedOrder.notes}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#EFE4DB] pt-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#5C4D44]">Update Status:</span>
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value as OrderStatus)}
                      className="rounded-xl border border-[#EFE4DB] bg-white px-3 py-1.5 text-xs font-bold text-rose"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="preparing">Preparing</option>
                      <option value="ready">Ready for Pickup</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <Button
                    asChild
                    variant="whatsapp"
                    size="sm"
                    className="gap-1.5"
                  >
                    <a
                      href={`https://wa.me/91${selectedOrder.customerPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                        `Hi ${selectedOrder.customerName}, this is Sweet Crumbs Bakery regarding your order ${selectedOrder.id}. It is currently ${selectedOrder.status.toUpperCase()}!`,
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="h-4 w-4" /> Message on WhatsApp
                    </a>
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

