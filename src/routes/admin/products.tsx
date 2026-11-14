import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Upload,
  Image as ImageIcon,
  Sparkles,
  Tag,
  ArrowUpDown,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useBakeryStore, type StoreProduct } from "@/context/BakeryStoreContext";
import { formatINR } from "@/config/products";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/admin/products")({
  head: () => ({
    meta: pageMeta(
      "Product Management — Sweet Crumbs Bakery Admin",
      "Manage handcrafted cakes, prices, images, stock, and categories.",
    ),
  }),
  component: AdminProductsPage,
});

function AdminProductsPage() {
  const { products, categories, addProduct, updateProduct, deleteProduct, toggleProductAvailability } =
    useBakeryStore();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<StoreProduct | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [category, setCategory] = useState("birthday");
  const [description, setDescription] = useState("");
  const [weight, setWeight] = useState("1 kg");
  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [image, setImage] = useState("");
  const [tag, setTag] = useState("");
  const [stock, setStock] = useState("10");
  const [isAvailable, setIsAvailable] = useState(true);

  const resetForm = () => {
    setEditingProduct(null);
    setName("");
    setCategory("birthday");
    setDescription("");
    setWeight("1 kg");
    setPrice("");
    setDiscountPrice("");
    setImage("");
    setTag("");
    setStock("10");
    setIsAvailable(true);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: StoreProduct) => {
    setEditingProduct(p);
    setName(p.name);
    setCategory(p.category);
    setDescription(p.description);
    setWeight(p.weight);
    setPrice(p.price.toString());
    setDiscountPrice(p.discountPrice ? p.discountPrice.toString() : "");
    setImage(p.image);
    setTag(p.tag || "");
    setStock(p.stock.toString());
    setIsAvailable(p.isAvailable);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter a cake name.");
      return;
    }
    const numPrice = Number(price);
    if (!numPrice || numPrice <= 0) {
      toast.error("Please specify a valid price.");
      return;
    }

    const cakeImage =
      image.trim() ||
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80";

    if (editingProduct) {
      await updateProduct(editingProduct.id, {
        name: name.trim(),
        category,
        description: description.trim(),
        weight: weight.trim() || "1 kg",
        price: numPrice,
        discountPrice: discountPrice ? Number(discountPrice) : undefined,
        image: cakeImage,
        tag: tag ? (tag as any) : undefined,
        stock: Number(stock) || 10,
        isAvailable,
      });
      toast.success(`"${name}" updated successfully! Changes are live on customer store.`);
    } else {
      await addProduct({
        name: name.trim(),
        category,
        description: description.trim(),
        weight: weight.trim() || "1 kg",
        price: numPrice,
        discountPrice: discountPrice ? Number(discountPrice) : undefined,
        image: cakeImage,
        tag: tag ? (tag as any) : undefined,
        stock: Number(stock) || 10,
        isAvailable,
      });
      toast.success(`New cake "${name}" added to menu!`);
    }

    setIsModalOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string, cakeName: string) => {
    if (window.confirm(`Are you sure you want to delete "${cakeName}"?`)) {
      await deleteProduct(id);
      toast.info(`"${cakeName}" removed from menu.`);
    }
  };

  // Filtered List
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <AdminLayout
      title="Product & Cake Management"
      subtitle="Add new creations, update pricing, control stock, and toggle menu availability."
      action={
        <Button onClick={handleOpenAdd} size="sm" variant="rose" className="shadow-soft gap-2">
          <Plus className="h-4 w-4" /> Add New Cake
        </Button>
      }
    >
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-[#8C7A70]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by cake title, flavour or ingredients…"
            className="w-full rounded-2xl border border-[#EFE4DB] bg-white pl-10 pr-4 py-2.5 text-xs text-[#1A100C] placeholder:text-[#A8988E] focus:border-rose focus:outline-none focus:ring-2 focus:ring-rose/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-[#8C7A70]" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-2xl border border-[#EFE4DB] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#5C4D44] focus:border-rose focus:outline-none"
          >
            <option value="all">All Categories ({products.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="overflow-hidden rounded-3xl border border-[#EFE4DB] bg-white shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F2] text-[0.7rem] uppercase tracking-wider text-[#8C7A70]">
              <tr>
                <th className="px-6 py-4 font-bold">Cake Item</th>
                <th className="px-6 py-4 font-bold">Category</th>
                <th className="px-6 py-4 font-bold">Weight</th>
                <th className="px-6 py-4 font-bold">Price</th>
                <th className="px-6 py-4 font-bold">Stock</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE4DB]">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="transition-colors hover:bg-[#FAF7F2]/60">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="h-12 w-12 rounded-xl object-cover shadow-soft border border-[#EFE4DB]"
                      />
                      <div>
                        <p className="font-bold text-[#1A100C] text-sm">{p.name}</p>
                        <p className="text-[0.65rem] text-[#8C7A70] line-clamp-1 max-w-xs">{p.description}</p>
                        {p.tag && (
                          <span className="mt-1 inline-block rounded-md bg-rose/10 px-2 py-0.5 text-[0.6rem] font-bold text-rose">
                            {p.tag}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-[#5C4D44] capitalize">
                    {p.category.replace("-", " ")}
                  </td>
                  <td className="px-6 py-4 text-[#5C4D44] font-medium">{p.weight}</td>
                  <td className="px-6 py-4">
                    <div className="font-display font-bold text-[#1A100C] text-sm">
                      {formatINR(p.price)}
                    </div>
                    {p.discountPrice && (
                      <span className="text-[0.65rem] text-rose line-through font-mono">
                        {formatINR(p.discountPrice)}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono font-bold text-[#1A100C]">{p.stock} units</span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={() => toggleProductAvailability(p.id)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.65rem] font-bold uppercase transition-transform active:scale-95 ${
                        p.isAvailable
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}
                    >
                      {p.isAvailable ? (
                        <>
                          <CheckCircle className="h-3 w-3" /> Available
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3" /> Sold Out
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOpenEdit(p)}
                        className="h-8 w-8 p-0 text-[#5C4D44] hover:text-rose"
                        aria-label="Edit product"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(p.id, p.name)}
                        className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                        aria-label="Delete product"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-2xl bg-white border-[#EFE4DB] rounded-3xl p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl font-bold text-[#1A100C]">
              {editingProduct ? "Edit Cake Details" : "Add New Handcrafted Cake"}
            </DialogTitle>
            <DialogDescription className="text-xs text-[#6B5E57]">
              Manage product pricing, cake imagery, category taxonomy, and stock levels.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4D44] mb-1">
                  Cake Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Belgian Truffle Indulgence"
                  className="w-full rounded-xl border border-[#EFE4DB] bg-[#FAF7F2] px-3.5 py-2.5 text-xs text-[#1A100C] focus:border-rose focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4D44] mb-1">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-[#EFE4DB] bg-[#FAF7F2] px-3.5 py-2.5 text-xs text-[#1A100C] focus:border-rose focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4D44] mb-1">
                  Selling Price (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="750"
                  className="w-full rounded-xl border border-[#EFE4DB] bg-[#FAF7F2] px-3.5 py-2.5 text-xs text-[#1A100C] focus:border-rose focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4D44] mb-1">
                  Discount Price (₹, optional)
                </label>
                <input
                  type="number"
                  min="0"
                  value={discountPrice}
                  onChange={(e) => setDiscountPrice(e.target.value)}
                  placeholder="680"
                  className="w-full rounded-xl border border-[#EFE4DB] bg-[#FAF7F2] px-3.5 py-2.5 text-xs text-[#1A100C] focus:border-rose focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4D44] mb-1">
                  Portion / Weight
                </label>
                <input
                  type="text"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="1 kg / 500 g / 2 tier"
                  className="w-full rounded-xl border border-[#EFE4DB] bg-[#FAF7F2] px-3.5 py-2.5 text-xs text-[#1A100C] focus:border-rose focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4D44] mb-1">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="12"
                  className="w-full rounded-xl border border-[#EFE4DB] bg-[#FAF7F2] px-3.5 py-2.5 text-xs text-[#1A100C] focus:border-rose focus:outline-none"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4D44] mb-1">
                Description & Flavor Notes
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Fresh cream, soft vanilla sponge layered with berry compote..."
                className="w-full rounded-xl border border-[#EFE4DB] bg-[#FAF7F2] px-3.5 py-2.5 text-xs text-[#1A100C] focus:border-rose focus:outline-none"
              />
            </div>

            {/* Image URL / Upload */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4D44] mb-1">
                Product Image URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full rounded-xl border border-[#EFE4DB] bg-[#FAF7F2] px-3.5 py-2.5 text-xs text-[#1A100C] focus:border-rose focus:outline-none"
                />
              </div>
              {image && (
                <div className="mt-2 flex items-center gap-3 rounded-2xl border border-[#EFE4DB] bg-[#FAF7F2] p-2">
                  <img src={image} alt="Preview" className="h-12 w-12 rounded-xl object-cover" />
                  <span className="text-[0.65rem] text-[#6B5E57] truncate">Image link validated</span>
                </div>
              )}
            </div>

            {/* Promotional Tag & Availability */}
            <div className="grid gap-4 sm:grid-cols-2 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4D44] mb-1">
                  Feature Tag (optional)
                </label>
                <select
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  className="w-full rounded-xl border border-[#EFE4DB] bg-[#FAF7F2] px-3.5 py-2.5 text-xs text-[#1A100C] focus:border-rose focus:outline-none"
                >
                  <option value="">None</option>
                  <option value="Bestseller">Bestseller</option>
                  <option value="New">New Arrival</option>
                  <option value="Chef's Pick">Chef's Pick</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-5">
                <input
                  type="checkbox"
                  id="avail"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                  className="h-4 w-4 rounded border-[#EFE4DB] text-rose accent-rose"
                />
                <label htmlFor="avail" className="text-xs font-bold text-[#1A100C] cursor-pointer">
                  In Stock & Available on Website
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-[#EFE4DB]">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="rose" size="sm" className="shadow-soft">
                {editingProduct ? "Save Changes" : "Publish Cake to Menu"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

