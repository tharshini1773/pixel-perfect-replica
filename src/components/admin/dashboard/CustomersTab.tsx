import { useState } from "react";
import { Search, Users, Phone, Mail, MapPin, ShoppingBag, Eye, Calendar } from "lucide-react";
import { useBakeryStore, type Customer } from "@/context/BakeryStoreContext";
import { formatINR } from "@/config/products";
import { Button } from "@/components/ui/button";

export function CustomersTab() {
  const { customers, orders } = useBakeryStore();
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

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
                <tr key={c.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
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
                      onClick={() => setSelectedCustomer(c)}
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

      {/* Customer Order History Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl border border-[#EFE4DB] bg-white p-6 shadow-2xl sm:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[#EFE4DB] pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-rose">Customer Record</span>
                <h3 className="font-display text-2xl font-bold text-[#1A100C]">{selectedCustomer.name}</h3>
                <p className="text-xs text-[#8C7A70]">
                  {selectedCustomer.phone} • Lifetime spend: {formatINR(selectedCustomer.totalSpent)}
                </p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="rounded-full p-2 text-[#8C7A70] hover:bg-[#FAF7F2] hover:text-[#1A100C]"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#8C7A70]">
                Order History ({customerOrders.length})
              </h4>

              {customerOrders.length === 0 ? (
                <p className="py-8 text-center text-xs text-[#8C7A70]">No recent orders found for this customer.</p>
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
          </div>
        </div>
      )}
    </div>
  );
}
