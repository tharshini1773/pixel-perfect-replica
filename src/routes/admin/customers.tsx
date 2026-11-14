import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Users,
  Search,
  Phone,
  Mail,
  ShoppingBag,
  IndianRupee,
  Calendar,
  MessageCircle,
  Eye,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useBakeryStore, type Customer } from "@/context/BakeryStoreContext";
import { formatINR } from "@/config/products";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/admin/customers")({
  head: () => ({
    meta: pageMeta(
      "Customer Management — Sweet Crumbs Bakery Admin",
      "Customer profiles, ordering frequency, lifetime spending, and communication logs.",
    ),
  }),
  component: AdminCustomersPage,
});

function AdminCustomersPage() {
  const { customers, orders } = useBakeryStore();
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase())),
  );

  const customerOrders = selectedCustomer
    ? orders.filter((o) => o.customerPhone === selectedCustomer.phone)
    : [];

  return (
    <AdminLayout
      title="Customer Directory"
      subtitle="View customer order histories, contact information, and repeat patron metrics."
    >
      {/* Search Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-[#8C7A70]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers by name, phone number, or email…"
            className="w-full rounded-2xl border border-[#EFE4DB] bg-white pl-10 pr-4 py-2.5 text-xs text-[#1A100C] placeholder:text-[#A8988E] focus:border-rose focus:outline-none focus:ring-2 focus:ring-rose/20"
          />
        </div>

        <div className="text-xs font-semibold text-[#8C7A70]">
          Total Registered Patrons: <span className="font-bold text-[#1A100C]">{customers.length}</span>
        </div>
      </div>

      {/* Customers Table */}
      <div className="overflow-hidden rounded-3xl border border-[#EFE4DB] bg-white shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F2] text-[0.7rem] uppercase tracking-wider text-[#8C7A70]">
              <tr>
                <th className="px-6 py-4 font-bold">Customer Name</th>
                <th className="px-6 py-4 font-bold">Contact Info</th>
                <th className="px-6 py-4 font-bold">Total Orders</th>
                <th className="px-6 py-4 font-bold">Lifetime Spent</th>
                <th className="px-6 py-4 font-bold">Last Order Date</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE4DB]">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#8C7A70]">
                    No customers match your search query.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="transition-colors hover:bg-[#FAF7F2]/60">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-full bg-rose/10 font-display font-bold text-rose text-sm">
                          {cust.name.slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-[#1A100C] text-sm">{cust.name}</p>
                          <span className="text-[0.65rem] text-[#8C7A70]">Customer ID: {cust.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <a
                          href={`tel:${cust.phone}`}
                          className="flex items-center gap-1.5 text-xs font-semibold text-[#1A100C] hover:text-rose"
                        >
                          <Phone className="h-3 w-3 text-rose" /> {cust.phone}
                        </a>
                        {cust.email && (
                          <span className="flex items-center gap-1.5 text-[0.68rem] text-[#8C7A70]">
                            <Mail className="h-3 w-3" /> {cust.email}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <ShoppingBag className="h-3.5 w-3.5 text-rose" />
                        <span className="font-bold text-[#1A100C]">{cust.totalOrders} order(s)</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-display font-bold text-sm text-[#1A100C]">
                      {formatINR(cust.totalSpent)}
                    </td>
                    <td className="px-6 py-4 text-[#5C4D44] font-medium">
                      {new Date(cust.lastOrderAt).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedCustomer(cust)}
                          className="h-8 text-rose hover:bg-rose/10 gap-1 text-xs"
                        >
                          <Eye className="h-3.5 w-3.5" /> Order History
                        </Button>
                        <Button
                          asChild
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-emerald-600 hover:bg-emerald-50"
                        >
                          <a
                            href={`https://wa.me/91${cust.phone.replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <MessageCircle className="h-4 w-4" />
                          </a>
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

      {/* Customer Order History Modal */}
      <Dialog open={!!selectedCustomer} onOpenChange={(open) => !open && setSelectedCustomer(null)}>
        <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-xl bg-white border-[#EFE4DB] rounded-3xl p-6 sm:p-8">
          {selectedCustomer && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-rose/10 font-display font-bold text-rose text-lg">
                    {selectedCustomer.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <DialogTitle className="font-display text-2xl font-bold text-[#1A100C]">
                      {selectedCustomer.name}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-[#6B5E57]">
                      {selectedCustomer.phone} {selectedCustomer.email && `· ${selectedCustomer.email}`}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="mt-6 space-y-4">
                <div className="grid grid-cols-2 gap-3 rounded-2xl border border-[#EFE4DB] bg-[#FAF7F2] p-4 text-center">
                  <div>
                    <span className="text-[0.65rem] font-bold uppercase tracking-wider text-[#8C7A70]">
                      Total Orders
                    </span>
                    <p className="font-display text-xl font-bold text-[#1A100C]">
                      {selectedCustomer.totalOrders}
                    </p>
                  </div>
                  <div>
                    <span className="text-[0.65rem] font-bold uppercase tracking-wider text-[#8C7A70]">
                      Lifetime Spent
                    </span>
                    <p className="font-display text-xl font-bold text-rose">
                      {formatINR(selectedCustomer.totalSpent)}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-display text-sm font-bold text-[#1A100C] mb-3">
                    Past Orders from this Customer
                  </h4>
                  {customerOrders.length === 0 ? (
                    <p className="text-xs text-[#8C7A70]">No detailed orders recorded yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {customerOrders.map((ord) => (
                        <div
                          key={ord.id}
                          className="rounded-2xl border border-[#EFE4DB] p-4 transition-colors hover:border-rose/30"
                        >
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span className="font-mono text-rose">{ord.id}</span>
                            <span className="capitalize text-[#5C4D44]">{ord.status}</span>
                          </div>
                          <div className="mt-2 text-xs text-[#5C4D44]">
                            {ord.items.map((it, idx) => (
                              <p key={idx}>
                                {it.quantity}x {it.productName} ({formatINR(it.total)})
                              </p>
                            ))}
                          </div>
                          <div className="mt-2 flex items-center justify-between border-t border-[#EFE4DB] pt-2 text-[0.7rem] text-[#8C7A70]">
                            <span>{new Date(ord.createdAt).toLocaleDateString("en-IN")}</span>
                            <span className="font-display font-bold text-sm text-[#1A100C]">
                              {formatINR(ord.totalAmount)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

