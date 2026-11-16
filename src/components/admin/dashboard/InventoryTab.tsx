import { useState, type FormEvent } from "react";
import { Plus, Boxes, AlertTriangle, CheckCircle2, Search, Edit2, Trash2, X, ChevronRight, ArrowLeft } from "lucide-react";
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

  // Detailed Modal States for Summary Cards
  const [showTrackedModal, setShowTrackedModal] = useState(false);
  const [showAlertsModal, setShowAlertsModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  // Search & Filter for Tracked Ingredients Modal
  const [modalSearch, setModalSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

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

  // Detailed Metrics derived from live Firestore data
  const outOfStockItems = inventory.filter((i) => i.quantity <= 0);
  const lowStockItems = inventory.filter((i) => i.quantity <= i.minThreshold);
  const adequateStockItems = inventory.filter((i) => i.quantity > i.minThreshold);

  const lowStockCount = lowStockItems.length;
  const outOfStockCount = outOfStockItems.length;
  const adequateStockCount = adequateStockItems.length;

  const totalInventoryValue = inventory.reduce(
    (sum, item) => sum + item.quantity * (item.costPerUnit || 0),
    0
  );

  const categories = Array.from(new Set(inventory.map((i) => i.category)));

  const latestRestockedDate =
    inventory
      .map((i) => i.lastRestocked)
      .filter(Boolean)
      .sort()
      .reverse()[0] || new Date().toISOString().split("T")[0];

  const formatINR = (val: number) => `₹${Math.round(val).toLocaleString("en-IN")}`;

  const modalFilteredIngredients = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(modalSearch.toLowerCase()) ||
      item.category.toLowerCase().includes(modalSearch.toLowerCase()) ||
      (item.supplier && item.supplier.toLowerCase().includes(modalSearch.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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

      {/* KPI Row - All 3 Cards Clickable */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div
          onClick={() => {
            setModalSearch("");
            setSelectedCategory("all");
            setShowTrackedModal(true);
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setShowTrackedModal(true);
            }
          }}
          className="rounded-3xl border border-[#EFE4DB] bg-white p-5 shadow-card cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all group text-left"
          title="Click to view all tracked ingredients"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8C7A70] group-hover:text-rose transition-colors">
              Tracked Ingredients
            </span>
            <span className="text-[0.68rem] text-rose font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
              View All &rarr;
            </span>
          </div>
          <p className="font-display text-2xl font-bold text-[#1A100C] mt-2">{inventory.length}</p>
          <p className="text-[0.7rem] text-[#8C7A70] mt-0.5">Essential bakery stock</p>
        </div>

        <div
          onClick={() => setShowAlertsModal(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setShowAlertsModal(true);
            }
          }}
          className="rounded-3xl border border-[#EFE4DB] bg-white p-5 shadow-card cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all group text-left"
          title="Click to view stock alerts and shortage items"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8C7A70] group-hover:text-amber-600 transition-colors">
              Stock Alerts
            </span>
            <span className="text-[0.68rem] text-amber-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
              Review &rarr;
            </span>
          </div>
          <p className={`font-display text-2xl font-bold mt-2 ${lowStockCount > 0 ? "text-amber-600" : "text-emerald-600"}`}>
            {lowStockCount} Items Low
          </p>
          <p className="text-[0.7rem] text-[#8C7A70] mt-0.5">Below reorder threshold</p>
        </div>

        <div
          onClick={() => setShowStatusModal(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setShowStatusModal(true);
            }
          }}
          className="col-span-2 sm:col-span-1 rounded-3xl border border-[#EFE4DB] bg-white p-5 shadow-card cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all group text-left"
          title="Click to view full inventory status & health breakdown"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8C7A70] group-hover:text-emerald-700 transition-colors">
              Inventory Status
            </span>
            <span className="text-[0.68rem] text-emerald-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
              Details &rarr;
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className={`h-3 w-3 rounded-full ${outOfStockCount > 0 ? "bg-red-500" : lowStockCount > 0 ? "bg-emerald-500" : "bg-emerald-500"} animate-pulse`} />
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
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

      {/* ================= MODAL 1: TRACKED INGREDIENTS MASTER ================= */}
      {showTrackedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-4xl rounded-3xl border border-[#EFE4DB] bg-white p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#EFE4DB] pb-4">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-rose/10 text-rose">
                  <Boxes className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-[#1A100C]">
                    Tracked Bakery Ingredients Master
                  </h3>
                  <p className="text-xs text-[#8C7A70]">
                    Complete register of all {inventory.length} ingredients and baking supplies
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTrackedModal(false)}
                className="rounded-full p-2 text-[#8C7A70] hover:bg-[#FAF7F2] hover:text-[#1A100C] transition-colors"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Top Stat Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
              <div className="rounded-2xl border border-[#EFE4DB] bg-[#FAF7F2] p-3.5 text-center">
                <p className="text-[0.68rem] font-bold uppercase tracking-wider text-[#8C7A70]">Total Ingredients</p>
                <p className="mt-1 font-display text-xl font-bold text-[#1A100C]">{inventory.length} Items</p>
                <p className="text-[0.65rem] text-[#8C7A70]">Active in database</p>
              </div>

              <div className="rounded-2xl border border-[#EFE4DB] bg-[#FAF7F2] p-3.5 text-center">
                <p className="text-[0.68rem] font-bold uppercase tracking-wider text-[#8C7A70]">Stock Valuation</p>
                <p className="mt-1 font-display text-xl font-bold text-emerald-700">{formatINR(totalInventoryValue)}</p>
                <p className="text-[0.65rem] text-[#8C7A70]">Estimated asset cost</p>
              </div>

              <div className="rounded-2xl border border-[#EFE4DB] bg-[#FAF7F2] p-3.5 text-center">
                <p className="text-[0.68rem] font-bold uppercase tracking-wider text-[#8C7A70]">Supply Categories</p>
                <p className="mt-1 font-display text-xl font-bold text-[#1A100C]">{categories.length} Types</p>
                <p className="text-[0.65rem] text-[#8C7A70]">Baking, dairy, cocoa</p>
              </div>

              <div className="rounded-2xl border border-[#EFE4DB] bg-[#FAF7F2] p-3.5 text-center">
                <p className="text-[0.68rem] font-bold uppercase tracking-wider text-[#8C7A70]">Low Stock Alerts</p>
                <p className={`mt-1 font-display text-xl font-bold ${lowStockCount > 0 ? "text-amber-600" : "text-emerald-700"}`}>
                  {lowStockCount} Items
                </p>
                <p className="text-[0.65rem] text-[#8C7A70]">{lowStockCount > 0 ? "Reorder advised" : "Healthy levels"}</p>
              </div>
            </div>

            {/* Search and Category Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Filter ingredients by name or category..."
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  className="w-full rounded-xl border border-[#EFE4DB] bg-white pl-9 pr-3 py-2 text-xs text-[#1A100C] focus:border-rose focus:outline-none"
                />
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#8C7A70]" />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    selectedCategory === "all"
                      ? "bg-rose text-white shadow-soft"
                      : "bg-[#FAF7F2] text-[#5C4D44] border border-[#EFE4DB] hover:bg-white"
                  }`}
                >
                  All ({inventory.length})
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                      selectedCategory === cat
                        ? "bg-rose text-white shadow-soft"
                        : "bg-[#FAF7F2] text-[#5C4D44] border border-[#EFE4DB] hover:bg-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Full Ingredients Table */}
            <div className="rounded-2xl border border-[#EFE4DB] overflow-hidden bg-white shadow-sm mb-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF7F2] border-b border-[#EFE4DB] text-[#8C7A70] uppercase font-bold tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Ingredient Name & Category</th>
                      <th className="py-3 px-4">Current Stock</th>
                      <th className="py-3 px-4">Min. Threshold</th>
                      <th className="py-3 px-4">Est. Cost / Unit</th>
                      <th className="py-3 px-4">Supplier Name</th>
                      <th className="py-3 px-4">Last Restocked</th>
                      <th className="py-3 px-4 text-right">Quick Restock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F2EBE5]">
                    {modalFilteredIngredients.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-[#8C7A70]">
                          No ingredients found matching your search.
                        </td>
                      </tr>
                    ) : (
                      modalFilteredIngredients.map((item) => {
                        const isLow = item.quantity <= item.minThreshold;
                        const isOut = item.quantity <= 0;
                        return (
                          <tr key={item.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                            <td className="py-3.5 px-4">
                              <p className="font-bold text-[#1A100C]">{item.name}</p>
                              <span className="inline-block mt-0.5 rounded-full bg-[#FAF7F2] px-2 py-0.5 text-[0.65rem] font-bold text-[#5C4D44] border border-[#EFE4DB]">
                                {item.category}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 font-bold">
                              <div className="flex items-center gap-1.5">
                                <span className={isOut ? "text-red-600 font-extrabold" : isLow ? "text-amber-600 font-extrabold" : "text-[#1A100C]"}>
                                  {item.quantity} {item.unit}
                                </span>
                                {isOut ? (
                                  <span className="rounded-full bg-red-100 px-1.5 py-0.2 text-[0.62rem] font-bold text-red-700">Out</span>
                                ) : isLow ? (
                                  <span className="rounded-full bg-amber-100 px-1.5 py-0.2 text-[0.62rem] font-bold text-amber-800">Low</span>
                                ) : null}
                              </div>
                            </td>

                            <td className="py-3.5 px-4 text-[#8C7A70]">
                              {item.minThreshold} {item.unit}
                            </td>

                            <td className="py-3.5 px-4 font-semibold text-[#1A100C]">
                              ₹{item.costPerUnit} / {item.unit}
                            </td>

                            <td className="py-3.5 px-4 text-[#5C4D44]">
                              {item.supplier || <span className="text-[#8C7A70] italic">General Bakery Supplier</span>}
                            </td>

                            <td className="py-3.5 px-4 text-[#8C7A70] text-[0.7rem]">
                              {item.lastRestocked || "N/A"}
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openRestock(item)}
                                className="text-[0.72rem] h-7 px-2.5 font-bold border-[#EFE4DB] text-rose hover:bg-rose/10"
                              >
                                Restock
                              </Button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#EFE4DB] pt-4">
              <span className="text-xs text-[#8C7A70]">
                Showing {modalFilteredIngredients.length} of {inventory.length} ingredients from live Firestore
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTrackedModal(false)}
                  className="text-xs"
                >
                  Close Register
                </Button>
                <Button
                  variant="rose"
                  size="sm"
                  onClick={() => {
                    setShowTrackedModal(false);
                    setIsModalOpen(true);
                  }}
                  className="text-xs font-bold gap-1 shadow-soft"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Ingredient
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: STOCK ALERTS & REORDER LIST ================= */}
      {showAlertsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-3xl rounded-3xl border border-[#EFE4DB] bg-white p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#EFE4DB] pb-4">
              <div className="flex items-center gap-3">
                <span className={`grid h-10 w-10 place-items-center rounded-2xl ${lowStockCount > 0 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                  <AlertTriangle className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-[#1A100C]">
                    Inventory Stock Alerts & Reorder List
                  </h3>
                  <p className="text-xs text-[#8C7A70]">
                    Ingredients at or below minimum threshold requiring immediate bakery restocking
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAlertsModal(false)}
                className="rounded-full p-2 text-[#8C7A70] hover:bg-[#FAF7F2] hover:text-[#1A100C] transition-colors"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Alert Status Banner */}
            <div className="my-5">
              {lowStockCount > 0 ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                      Action Required: {lowStockCount} Item{lowStockCount > 1 ? "s" : ""} Below Safety Threshold
                    </h4>
                    <p className="text-xs text-amber-800 mt-0.5">
                      The bakery kitchen is running low on the ingredients below. Please initiate reorders with the listed suppliers to avoid production delays.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                      All Supplies Healthy
                    </h4>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      No ingredients are currently below their minimum threshold. All bakery baking essentials are well stocked.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Low Stock List */}
            {lowStockItems.length === 0 ? (
              <div className="rounded-2xl border border-[#EFE4DB] bg-[#FAF7F2] p-8 text-center my-4">
                <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto mb-2" />
                <p className="font-display text-lg font-bold text-[#1A100C]">Zero Critical Alerts</p>
                <p className="text-xs text-[#8C7A70] mt-1 max-w-sm mx-auto">
                  Every tracked ingredient currently meets or exceeds the required safety threshold.
                </p>
              </div>
            ) : (
              <div className="space-y-3 mb-6">
                {lowStockItems.map((item) => {
                  const shortage = Math.max(0, item.minThreshold - item.quantity);
                  const isOutOfStock = item.quantity <= 0;
                  return (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-[#EFE4DB] bg-white p-4.5 shadow-sm hover:border-amber-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <h4 className="font-display text-base font-bold text-[#1A100C]">{item.name}</h4>
                          <span className="rounded-full bg-[#FAF7F2] px-2 py-0.5 text-[0.65rem] font-bold text-[#5C4D44] border border-[#EFE4DB]">
                            {item.category}
                          </span>
                          {isOutOfStock ? (
                            <span className="rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-[0.65rem] font-bold">
                              Out of Stock
                            </span>
                          ) : (
                            <span className="rounded-full bg-amber-100 text-amber-800 px-2 py-0.5 text-[0.65rem] font-bold">
                              Low Stock
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-xs text-[#5C4D44]">
                          <div>
                            <span className="text-[#8C7A70]">Available Stock: </span>
                            <span className="font-bold text-amber-700">{item.quantity} {item.unit}</span>
                          </div>
                          <div>
                            <span className="text-[#8C7A70]">Min. Required: </span>
                            <span className="font-bold text-[#1A100C]">{item.minThreshold} {item.unit}</span>
                          </div>
                          <div>
                            <span className="text-[#8C7A70]">Stock Shortage: </span>
                            <span className="font-bold text-red-600">
                              -{shortage > 0 ? (shortage % 1 === 0 ? shortage : shortage.toFixed(1)) : 0} {item.unit}
                            </span>
                          </div>
                        </div>

                        <div className="text-[0.72rem] text-[#8C7A70] flex items-center gap-1.5 pt-1">
                          <span className="font-bold text-[#5C4D44]">Supplier:</span>
                          <span>{item.supplier || "Wholesale Bakery Depot"}</span>
                          <span className="text-[#D0C2B6]">•</span>
                          <span>Est. Cost: ₹{item.costPerUnit} / {item.unit}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#F2EBE5]">
                        <Button
                          variant="rose"
                          size="sm"
                          onClick={() => openRestock(item)}
                          className="font-bold text-xs gap-1 shadow-soft"
                        >
                          Restock Now
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-[#EFE4DB] pt-4">
              <span className="text-xs text-[#8C7A70]">
                {lowStockCount} alert item{lowStockCount === 1 ? "" : "s"} identified from live inventory
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAlertsModal(false)}
                className="text-xs"
              >
                Close Alerts
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: INVENTORY HEALTH & STATUS ================= */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-4xl rounded-3xl border border-[#EFE4DB] bg-white p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#EFE4DB] pb-4">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <CheckCircle2 className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-[#1A100C]">
                    Bakery Inventory Health & Stock Status
                  </h3>
                  <p className="text-xs text-[#8C7A70]">
                    Complete breakdown of overall inventory health, ingredient statuses, and stock reserves
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowStatusModal(false)}
                className="rounded-full p-2 text-[#8C7A70] hover:bg-[#FAF7F2] hover:text-[#1A100C] transition-colors"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Health Banner */}
            <div className="rounded-2xl border border-[#EFE4DB] bg-[#FAF7F2] p-5 my-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className={`h-4 w-4 rounded-full ${outOfStockCount > 0 ? "bg-red-500" : lowStockCount > 0 ? "bg-emerald-500" : "bg-emerald-500"} animate-pulse shrink-0`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-display text-lg font-bold text-[#1A100C]">
                        Overall Inventory Health:
                      </h4>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        outOfStockCount > 0
                          ? "bg-red-100 text-red-700"
                          : "bg-emerald-100 text-emerald-800"
                      }`}>
                        {outOfStockCount > 0 ? "Critical Shortage" : "Supplies Adequate"}
                      </span>
                    </div>
                    <p className="text-xs text-[#8C7A70] mt-0.5">
                      {outOfStockCount > 0
                        ? `${outOfStockCount} ingredient(s) are completely exhausted. Immediate procurement required.`
                        : lowStockCount > 0
                        ? `${adequateStockCount} of ${inventory.length} ingredients are well stocked. ${lowStockCount} ingredient(s) approaching reorder threshold.`
                        : "All ingredients meet or exceed target safety thresholds. Kitchen is fully prepared."}
                    </p>
                  </div>
                </div>

                <div className="sm:text-right shrink-0">
                  <span className="text-[0.68rem] font-bold uppercase tracking-wider text-[#8C7A70] block">
                    Last Inventory Sync
                  </span>
                  <span className="text-xs font-bold text-[#1A100C] mt-0.5 block">
                    {latestRestockedDate} (Firestore Live)
                  </span>
                </div>
              </div>
            </div>

            {/* 4 Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="rounded-2xl border border-[#EFE4DB] bg-white p-4 shadow-sm text-center">
                <p className="text-[0.68rem] font-bold uppercase tracking-wider text-[#8C7A70]">Inventory Health</p>
                <p className="mt-1 font-display text-xl font-bold text-emerald-700">
                  {Math.round((adequateStockCount / (inventory.length || 1)) * 100)}%
                </p>
                <p className="text-[0.65rem] text-[#8C7A70]">Adequacy ratio</p>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 shadow-sm text-center">
                <p className="text-[0.68rem] font-bold uppercase tracking-wider text-emerald-800">Adequate Stock</p>
                <p className="mt-1 font-display text-xl font-bold text-emerald-700">{adequateStockCount} Items</p>
                <p className="text-[0.65rem] text-emerald-600 font-semibold">Above min threshold</p>
              </div>

              <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4 shadow-sm text-center">
                <p className="text-[0.68rem] font-bold uppercase tracking-wider text-amber-800">Low-Stock Items</p>
                <p className="mt-1 font-display text-xl font-bold text-amber-600">{lowStockCount} Items</p>
                <p className="text-[0.65rem] text-amber-600 font-semibold">Near reorder limit</p>
              </div>

              <div className="rounded-2xl border border-red-100 bg-red-50/50 p-4 shadow-sm text-center">
                <p className="text-[0.68rem] font-bold uppercase tracking-wider text-red-800">Out-of-Stock</p>
                <p className="mt-1 font-display text-xl font-bold text-red-600">{outOfStockCount} Items</p>
                <p className="text-[0.65rem] text-red-600 font-semibold">Empty inventory</p>
              </div>
            </div>

            {/* Ingredient-Wise Stock Status Table */}
            <div className="rounded-2xl border border-[#EFE4DB] overflow-hidden bg-white shadow-sm mb-6">
              <div className="p-4 bg-[#FAF7F2] border-b border-[#EFE4DB] flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A100C]">
                  Ingredient-Wise Stock Status Breakdown
                </h4>
                <span className="text-[0.68rem] text-[#8C7A70]">
                  Live gauges relative to minimum threshold
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[#EFE4DB] text-[#8C7A70] uppercase font-bold tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Ingredient Name</th>
                      <th className="py-3 px-4">Current Stock / Min</th>
                      <th className="py-3 px-4">Stock Status</th>
                      <th className="py-3 px-4">Health Gauge</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F2EBE5]">
                    {inventory.map((item) => {
                      const isOut = item.quantity <= 0;
                      const isLow = !isOut && item.quantity <= item.minThreshold;
                      const percentage = Math.min(100, Math.round((item.quantity / (item.minThreshold * 2 || 1)) * 100));

                      return (
                        <tr key={item.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-[#1A100C]">{item.name}</p>
                            <p className="text-[0.68rem] text-[#8C7A70]">{item.category} • Supplier: {item.supplier || "Bakery General"}</p>
                          </td>

                          <td className="py-3.5 px-4 font-semibold text-[#1A100C]">
                            {item.quantity} / {item.minThreshold} {item.unit}
                          </td>

                          <td className="py-3.5 px-4">
                            {isOut ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-[0.68rem] font-bold text-red-700">
                                <span className="h-1.5 w-1.5 rounded-full bg-red-600" /> Out of Stock
                              </span>
                            ) : isLow ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[0.68rem] font-bold text-amber-800">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-600" /> Low Stock
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[0.68rem] font-bold text-emerald-800">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" /> In Stock
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 w-44">
                            <div className="flex items-center gap-2">
                              <div className="h-2 flex-1 rounded-full bg-[#EFE4DB] overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    isOut
                                      ? "bg-red-500"
                                      : isLow
                                      ? "bg-amber-500"
                                      : "bg-emerald-500"
                                  }`}
                                  style={{ width: `${Math.max(5, percentage)}%` }}
                                />
                              </div>
                              <span className="text-[0.68rem] font-bold text-[#8C7A70] w-9 text-right">
                                {percentage}%
                              </span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openRestock(item)}
                              className="text-[0.72rem] h-7 px-2.5 font-bold border-[#EFE4DB] text-rose hover:bg-rose/10"
                            >
                              Restock
                            </Button>
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
                Last updated: {latestRestockedDate} • Synced with Bakery Firestore database
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowStatusModal(false)}
                className="text-xs"
              >
                Close Report
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
