import { useState, type FormEvent } from "react";
import { Plus, Boxes, AlertTriangle, CheckCircle2, Search, Edit2, Trash2 } from "lucide-react";
import { useBakeryStore, type InventoryItem } from "@/context/BakeryStoreContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function InventoryTab() {
  const { inventory, addInventoryItem, updateInventoryStock, deleteInventoryItem } = useBakeryStore();
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<InventoryItem | null>(null);
  const [restockQty, setRestockQty] = useState("");

  // New Item State
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Baking Essentials");
  const [quantity, setQuantity] = useState("20");
  const [unit, setUnit] = useState("kg");
  const [minThreshold, setMinThreshold] = useState("5");
  const [costPerUnit, setCostPerUnit] = useState("50");
  const [supplier, setSupplier] = useState("");

  const filtered = inventory.filter(
    (i) => i.name.toLowerCase().includes(search.toLowerCase()) || i.category.toLowerCase().includes(search.toLowerCase())
  );

  const lowStockCount = inventory.filter((i) => i.quantity <= i.minThreshold).length;

  const handleAddItem = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter ingredient name.");
      return;
    }

    const payload = {
      name: name.trim(),
      category,
      quantity: Number(quantity) || 0,
      unit,
      minThreshold: Number(minThreshold) || 5,
      costPerUnit: Number(costPerUnit) || 0,
      lastRestocked: new Date().toISOString().split("T")[0]!,
      supplier: supplier.trim() || undefined,
    };

    await addInventoryItem(payload);
    toast.success(`"${name}" added to bakery inventory!`);
    setIsModalOpen(false);
  };

  const openRestock = (item: InventoryItem) => {
    setActiveItem(item);
    setRestockQty(item.quantity.toString());
    setIsRestockModalOpen(true);
  };

  const handleUpdateStock = async (e: FormEvent) => {
    e.preventDefault();
    if (!activeItem) return;
    const newQty = Number(restockQty);
    if (isNaN(newQty) || newQty < 0) {
      toast.error("Please provide valid quantity.");
      return;
    }

    await updateInventoryStock(activeItem.id, newQty);
    toast.success(`Updated stock for ${activeItem.name} to ${newQty} ${activeItem.unit}`);
    setIsRestockModalOpen(false);
  };

  const handleDelete = async (item: InventoryItem) => {
    if (confirm(`Remove "${item.name}" from inventory?`)) {
      await deleteInventoryItem(item.id);
      toast.success(`Removed ${item.name}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-[#1A100C]">Bakery Ingredient & Supply Inventory</h2>
          <p className="text-xs text-[#8C7A70]">Monitor flour, butter, chocolates, cream and baking decorations</p>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={() => setIsModalOpen(true)} variant="rose" size="sm" className="gap-1.5 shadow-soft">
            <Plus className="h-4 w-4" /> Add Ingredient
          </Button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-[#EFE4DB] bg-white p-5 shadow-card">
          <span className="text-xs font-bold uppercase tracking-wider text-[#8C7A70]">Tracked Ingredients</span>
          <p className="font-display text-2xl font-bold text-[#1A100C] mt-2">{inventory.length}</p>
          <p className="text-[0.7rem] text-[#8C7A70] mt-0.5">Essential bakery stock</p>
        </div>

        <div className="rounded-3xl border border-[#EFE4DB] bg-white p-5 shadow-card">
          <span className="text-xs font-bold uppercase tracking-wider text-[#8C7A70]">Stock Alerts</span>
          <p className={`font-display text-2xl font-bold mt-2 ${lowStockCount > 0 ? "text-amber-600" : "text-emerald-600"}`}>
            {lowStockCount} Items Low
          </p>
          <p className="text-[0.7rem] text-[#8C7A70] mt-0.5">Below reorder threshold</p>
        </div>

        <div className="col-span-2 sm:col-span-1 rounded-3xl border border-[#EFE4DB] bg-white p-5 shadow-card">
          <span className="text-xs font-bold uppercase tracking-wider text-[#8C7A70]">Inventory Status</span>
          <div className="flex items-center gap-2 mt-2">
            <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-bold text-[#1A100C]">Supplies Adequate</span>
          </div>
          <p className="text-[0.7rem] text-[#8C7A70] mt-0.5">Refreshed from Firestore</p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search ingredient by name or category (e.g. Flour, Cocoa, Butter)…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-2xl border border-[#EFE4DB] bg-white pl-10 pr-4 py-2.5 text-xs text-[#1A100C] focus:border-rose focus:outline-none"
        />
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#8C7A70]" />
      </div>

      {/* Inventory Table */}
      <div className="rounded-3xl border border-[#EFE4DB] bg-white p-6 shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#EFE4DB] text-[#8C7A70] uppercase font-bold tracking-wider">
                <th className="pb-3">Ingredient Name</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Current Stock</th>
                <th className="pb-3">Min. Threshold</th>
                <th className="pb-3">Est. Cost / Unit</th>
                <th className="pb-3">Last Restocked</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2EBE5]">
              {filtered.map((item) => {
                const isLow = item.quantity <= item.minThreshold;
                return (
                  <tr key={item.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                    <td className="py-4">
                      <p className="font-bold text-[#1A100C]">{item.name}</p>
                      {item.supplier && <p className="text-[0.68rem] text-[#8C7A70]">Supplier: {item.supplier}</p>}
                    </td>

                    <td className="py-4">
                      <span className="rounded-full bg-[#FAF7F2] px-2.5 py-1 text-[0.68rem] font-bold text-[#5C4D44] border border-[#EFE4DB]">
                        {item.category}
                      </span>
                    </td>

                    <td className="py-4 font-bold">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm ${isLow ? "text-amber-600 font-extrabold" : "text-[#1A100C]"}`}>
                          {item.quantity} {item.unit}
                        </span>
                        {isLow && (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-2 py-0.5 text-[0.65rem] font-bold text-amber-800">
                            <AlertTriangle className="h-3 w-3" /> Low
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 text-[#8C7A70]">
                      {item.minThreshold} {item.unit}
                    </td>

                    <td className="py-4 font-semibold text-[#1A100C]">
                      ₹{item.costPerUnit} / {item.unit}
                    </td>

                    <td className="py-4 text-[#8C7A70] text-[0.72rem]">
                      {item.lastRestocked}
                    </td>

                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openRestock(item)}
                          className="text-xs font-semibold border-[#EFE4DB] text-rose hover:bg-rose/10"
                        >
                          Restock
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item)}
                          className="h-8 w-8 p-0 text-[#8C7A70] hover:text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restock Modal */}
      {isRestockModalOpen && activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-[#EFE4DB] bg-white p-6 shadow-2xl">
            <h3 className="font-display text-lg font-bold text-[#1A100C]">
              Update Stock: {activeItem.name}
            </h3>
            <p className="text-xs text-[#8C7A70] mt-1">Current quantity: {activeItem.quantity} {activeItem.unit}</p>

            <form onSubmit={handleUpdateStock} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4D44] mb-1">
                  New Quantity ({activeItem.unit})
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={restockQty}
                  onChange={(e) => setRestockQty(e.target.value)}
                  className="w-full rounded-xl border border-[#EFE4DB] p-2.5 text-sm text-[#1A100C] focus:border-rose focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsRestockModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="rose" size="sm" className="font-bold">
                  Save Stock
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-[#EFE4DB] bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-center justify-between border-b border-[#EFE4DB] pb-4">
              <h3 className="font-display text-xl font-bold text-[#1A100C]">Add Inventory Ingredient</h3>
              <button onClick={() => setIsModalOpen(false)} className="rounded-full p-2 text-[#8C7A70]">✕</button>
            </div>

            <form onSubmit={handleAddItem} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4D44] mb-1">
                  Ingredient Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Cocoa Powder Dutch"
                  className="w-full rounded-xl border border-[#EFE4DB] p-2.5 text-xs text-[#1A100C] focus:border-rose focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4D44] mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-[#EFE4DB] p-2.5 text-xs text-[#1A100C] focus:border-rose focus:outline-none"
                  >
                    <option value="Baking Essentials">Baking Essentials</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Chocolates">Chocolates</option>
                    <option value="Decorations">Decorations</option>
                    <option value="Flavors & Additives">Flavors & Additives</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4D44] mb-1">
                    Unit of Measure
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full rounded-xl border border-[#EFE4DB] p-2.5 text-xs text-[#1A100C] focus:border-rose focus:outline-none"
                  >
                    <option value="kg">Kilograms (kg)</option>
                    <option value="liters">Liters (L)</option>
                    <option value="pieces">Pieces (pcs)</option>
                    <option value="boxes">Boxes</option>
                    <option value="g">Grams (g)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4D44] mb-1">
                    Initial Stock
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="20"
                    className="w-full rounded-xl border border-[#EFE4DB] p-2.5 text-xs text-[#1A100C] focus:border-rose focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4D44] mb-1">
                    Min Alert Threshold
                  </label>
                  <input
                    type="number"
                    value={minThreshold}
                    onChange={(e) => setMinThreshold(e.target.value)}
                    placeholder="5"
                    className="w-full rounded-xl border border-[#EFE4DB] p-2.5 text-xs text-[#1A100C] focus:border-rose focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4D44] mb-1">
                  Supplier / Vendor
                </label>
                <input
                  type="text"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  placeholder="e.g. Thoothukudi Bakers Wholesale"
                  className="w-full rounded-xl border border-[#EFE4DB] p-2.5 text-xs text-[#1A100C] focus:border-rose focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-[#EFE4DB] pt-4 mt-6">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="rose" size="sm" className="font-bold shadow-soft">
                  Add to Inventory
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
