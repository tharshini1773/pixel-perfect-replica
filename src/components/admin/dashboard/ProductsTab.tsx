import { useState, type FormEvent } from "react";
import {
  Plus,
  Search,
  Cake,
  Edit2,
  Trash2,
  Upload,
  CheckCircle2,
  X,
  Sparkles,
  Eye,
  Star,
} from "lucide-react";
import { useBakeryStore, type StoreProduct } from "@/context/BakeryStoreContext";
import { formatINR } from "@/config/products";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ProductsTab() {
  const { products, categories, addProduct, updateProduct, deleteProduct, toggleProductAvailability, uploadProductImage } =
    useBakeryStore();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<StoreProduct | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [category, setCategory] = useState("birthday");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [weight, setWeight] = useState("1 kg");
  const [sizes, setSizes] = useState("0.5 kg, 1 kg, 2 kg");
  const [flavours, setFlavours] = useState("Belgian Chocolate, Vanilla Bean, Red Velvet");
  const [isEggless, setIsEggless] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [stock, setStock] = useState("10");
  const [imageUrl, setImageUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const openAddModal = () => {
    setEditingProduct(null);
    setName("");
    setCategory(categories[0]?.id || "birthday");
    setDescription("");
    setPrice("750");
    setDiscountPrice("");
    setWeight("1 kg");
    setSizes("0.5 kg, 1 kg, 2 kg");
    setFlavours("Belgian Chocolate, Vanilla Bean, Red Velvet");
    setIsEggless(true);
    setIsFeatured(false);
    setStock("12");
    setImageUrl("https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80");
    setIsModalOpen(true);
  };

  const openEditModal = (p: StoreProduct) => {
    setEditingProduct(p);
    setName(p.name);
    setCategory(p.category);
    setDescription(p.description);
    setPrice(p.price.toString());
    setDiscountPrice(p.discountPrice ? p.discountPrice.toString() : "");
    setWeight(p.weight);
    setSizes(p.availableSizes ? p.availableSizes.join(", ") : "0.5 kg, 1 kg, 2 kg");
    setFlavours(p.flavours ? p.flavours.join(", ") : "Belgian Chocolate, Vanilla Bean");
    setIsEggless(Boolean(p.isEggless));
    setIsFeatured(Boolean(p.isFeatured));
    setStock(p.stock.toString());
    setImageUrl(p.image);
    setIsModalOpen(true);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const uploadedUrl = await uploadProductImage(file);
      setImageUrl(uploadedUrl);
      toast.success("Cake photograph uploaded to Firebase Storage!");
    } catch {
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter cake product name.");
      return;
    }
    const numPrice = Number(price);
    if (!numPrice || numPrice <= 0) {
      toast.error("Please enter a valid cake price.");
      return;
    }

    const cakePayload = {
      name: name.trim(),
      category,
      description: description.trim(),
      weight: weight.trim() || "1 kg",
      price: numPrice,
      discountPrice: discountPrice ? Number(discountPrice) : undefined,
      image: imageUrl.trim() || "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80",
      availableSizes: sizes.split(",").map((s) => s.trim()).filter(Boolean),
      flavours: flavours.split(",").map((s) => s.trim()).filter(Boolean),
      isEggless,
      isFeatured,
      isAvailable: true,
      stock: Number(stock) || 10,
    };

    if (editingProduct) {
      await updateProduct(editingProduct.id, cakePayload);
      toast.success(`"${name}" updated successfully in Firestore.`);
    } else {
      await addProduct(cakePayload);
      toast.success(`New cake "${name}" added to bakery catalog!`);
    }

    setIsModalOpen(false);
  };

  const handleDelete = async (p: StoreProduct) => {
    if (confirm(`Are you sure you want to delete "${p.name}"?`)) {
      await deleteProduct(p.id);
      toast.success(`"${p.name}" removed from catalog.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-[#1A100C]">Bakery Cake Catalog</h2>
          <p className="text-xs text-[#8C7A70]">Manage cake listings, pricing, sizes, inventory and Firebase images</p>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={openAddModal} variant="rose" size="sm" className="gap-1.5 shadow-soft">
            <Plus className="h-4 w-4" /> Add New Cake
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search cake by name or ingredient…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-[#EFE4DB] bg-white pl-10 pr-4 py-2.5 text-xs text-[#1A100C] focus:border-rose focus:outline-none"
          />
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#8C7A70]" />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="rounded-2xl border border-[#EFE4DB] bg-white px-4 py-2.5 text-xs font-bold text-[#5C4D44] focus:border-rose focus:outline-none"
        >
          <option value="all">All Categories ({products.length})</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Products Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((p) => (
          <div
            key={p.id}
            className="group relative overflow-hidden rounded-3xl border border-[#EFE4DB] bg-white shadow-card transition-all hover:shadow-hover"
          >
            {/* Image & Badges */}
            <div className="relative h-48 w-full overflow-hidden bg-[#FAF7F2]">
              <img
                src={p.image}
                alt={p.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                <span className="rounded-full bg-white/90 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-[#1A100C] shadow-sm backdrop-blur-sm">
                  {p.category}
                </span>
                {p.isEggless && (
                  <span className="rounded-full bg-emerald-500 text-white px-2.5 py-1 text-[0.65rem] font-bold shadow-sm">
                    Eggless
                  </span>
                )}
                {p.isFeatured && (
                  <span className="rounded-full bg-amber-500 text-white px-2 py-1 text-[0.65rem] font-bold flex items-center gap-1 shadow-sm">
                    <Star className="h-3 w-3 fill-current" /> Featured
                  </span>
                )}
              </div>

              <div className="absolute top-3 right-3">
                <button
                  onClick={() => toggleProductAvailability(p.id)}
                  className={`rounded-full px-2.5 py-1 text-[0.65rem] font-bold shadow-sm transition-all ${
                    p.isAvailable
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {p.isAvailable ? "Available" : "Disabled"}
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="p-5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display text-base font-bold text-[#1A100C] line-clamp-1">{p.name}</h3>
                <div className="text-right shrink-0">
                  <span className="font-bold text-rose text-base">{formatINR(p.price)}</span>
                  {p.discountPrice && (
                    <span className="block text-[0.7rem] text-[#8C7A70] line-through">
                      {formatINR(p.discountPrice)}
                    </span>
                  )}
                </div>
              </div>

              <p className="mt-1.5 text-xs text-[#6B5E57] line-clamp-2 leading-relaxed">
                {p.description}
              </p>

              <div className="mt-4 flex items-center justify-between border-t border-[#F2EBE5] pt-3 text-[0.72rem] text-[#8C7A70]">
                <span>Base Weight: <strong>{p.weight}</strong></span>
                <span>Stock: <strong className={p.stock <= 5 ? "text-amber-600 font-bold" : "text-emerald-700 font-bold"}>{p.stock} units</strong></span>
              </div>

              {/* Actions */}
              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditModal(p)}
                  className="flex-1 text-xs font-semibold gap-1.5 border-[#EFE4DB] text-[#5C4D44] hover:bg-[#FAF7F2]"
                >
                  <Edit2 className="h-3.5 w-3.5 text-rose" /> Edit Cake
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(p)}
                  className="h-9 w-9 p-0 text-[#8C7A70] hover:text-red-600 hover:bg-red-50 rounded-xl"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Cake Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl border border-[#EFE4DB] bg-white p-6 shadow-2xl sm:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#EFE4DB] pb-4">
              <h3 className="font-display text-xl font-bold text-[#1A100C]">
                {editingProduct ? "Edit Cake Product" : "Add New Artisan Cake"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-2 text-[#8C7A70] hover:bg-[#FAF7F2] hover:text-[#1A100C]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Cake Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4D44] mb-1">
                    Cake Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Belgian Dark Truffle Cake"
                    className="w-full rounded-xl border border-[#EFE4DB] p-2.5 text-xs text-[#1A100C] focus:border-rose focus:outline-none"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4D44] mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-[#EFE4DB] p-2.5 text-xs text-[#1A100C] focus:border-rose focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Base Weight */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4D44] mb-1">
                    Default Base Weight
                  </label>
                  <input
                    type="text"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="1 kg"
                    className="w-full rounded-xl border border-[#EFE4DB] p-2.5 text-xs text-[#1A100C] focus:border-rose focus:outline-none"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4D44] mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="750"
                    className="w-full rounded-xl border border-[#EFE4DB] p-2.5 text-xs text-[#1A100C] focus:border-rose focus:outline-none"
                  />
                </div>

                {/* Stock Quantity */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4D44] mb-1">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="10"
                    className="w-full rounded-xl border border-[#EFE4DB] p-2.5 text-xs text-[#1A100C] focus:border-rose focus:outline-none"
                  />
                </div>

                {/* Available Sizes */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4D44] mb-1">
                    Available Sizes (comma separated)
                  </label>
                  <input
                    type="text"
                    value={sizes}
                    onChange={(e) => setSizes(e.target.value)}
                    placeholder="0.5 kg, 1 kg, 2 kg"
                    className="w-full rounded-xl border border-[#EFE4DB] p-2.5 text-xs text-[#1A100C] focus:border-rose focus:outline-none"
                  />
                </div>

                {/* Flavours */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4D44] mb-1">
                    Flavours Available
                  </label>
                  <input
                    type="text"
                    value={flavours}
                    onChange={(e) => setFlavours(e.target.value)}
                    placeholder="Chocolate, Vanilla, Red Velvet"
                    className="w-full rounded-xl border border-[#EFE4DB] p-2.5 text-xs text-[#1A100C] focus:border-rose focus:outline-none"
                  />
                </div>

                {/* Image Upload & Firebase Storage */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4D44] mb-1">
                    Cake Photograph (Upload to Firebase Storage or Paste Image URL)
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="flex-1 rounded-xl border border-[#EFE4DB] p-2.5 text-xs text-[#1A100C] focus:border-rose focus:outline-none"
                    />
                    <label className="cursor-pointer rounded-xl border border-rose/30 bg-rose/10 px-3 py-2.5 text-xs font-bold text-rose hover:bg-rose/20 flex items-center gap-1.5 shrink-0">
                      <Upload className="h-3.5 w-3.5" />
                      <span>{uploadingImage ? "Uploading…" : "Upload"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        disabled={uploadingImage}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {imageUrl && (
                    <div className="mt-2 flex items-center gap-3">
                      <img
                        src={imageUrl}
                        alt="Preview"
                        className="h-16 w-16 rounded-xl object-cover border border-[#EFE4DB]"
                      />
                      <p className="text-[0.72rem] text-[#8C7A70]">Photograph preview</p>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4D44] mb-1">
                    Cake Description
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Rich layers of cocoa sponge, Belgian chocolate mousse and chocolate pearls..."
                    className="w-full rounded-xl border border-[#EFE4DB] p-2.5 text-xs text-[#1A100C] focus:border-rose focus:outline-none"
                  />
                </div>

                {/* Options: Eggless & Featured */}
                <div className="sm:col-span-2 flex flex-wrap gap-6 pt-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-[#5C4D44] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isEggless}
                      onChange={(e) => setIsEggless(e.target.checked)}
                      className="h-4 w-4 rounded border-[#EFE4DB] text-rose accent-rose"
                    />
                    <span>100% Eggless Cake</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-bold text-[#5C4D44] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="h-4 w-4 rounded border-[#EFE4DB] text-rose accent-rose"
                    />
                    <span>Feature on Homepage Showcase</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-[#EFE4DB] pt-4 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  className="text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button type="submit" variant="rose" size="sm" className="text-xs font-bold shadow-soft">
                  {editingProduct ? "Save Changes to Firestore" : "Create Cake Listing"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
