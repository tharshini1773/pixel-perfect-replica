import { useState, type FormEvent } from "react";
import { Plus, FolderTree, Edit2, Trash2, Cake, Sparkles } from "lucide-react";
import { useBakeryStore, type Category } from "@/context/BakeryStoreContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function CategoriesTab() {
  const { categories, products, addCategory, updateCategory, deleteCategory } = useBakeryStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [blurb, setBlurb] = useState("");
  const [image, setImage] = useState("");

  const openAddModal = () => {
    setEditingCategory(null);
    setId("");
    setName("");
    setBlurb("");
    setImage("/images/cake-birthday.jpg");
    setIsModalOpen(true);
  };

  const openEditModal = (c: Category) => {
    setEditingCategory(c);
    setId(c.id);
    setName(c.name);
    setBlurb(c.blurb || "");
    let img = c.image;
    if (img?.includes("photo-1535141192574") || (!img && c.id === "birthday")) {
      img = "/images/cake-birthday.jpg";
    } else if (img?.includes("photo-1518047601542") || (!img && c.id === "anniversary")) {
      img = "/images/cake-anniversary.jpg";
    }
    setImage(img || "/images/cake-birthday.jpg");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter category name.");
      return;
    }

    const catId = editingCategory ? editingCategory.id : (id.trim().toLowerCase().replace(/\s+/g, "-") || `cat-${Date.now()}`);
    const payload: Category = {
      id: catId,
      name: name.trim(),
      blurb: blurb.trim() || undefined,
      image: image.trim() || "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80",
    };

    if (editingCategory) {
      await updateCategory(editingCategory.id, payload);
      toast.success(`Category "${name}" updated in Firestore!`);
    } else {
      await addCategory(payload);
      toast.success(`Category "${name}" created!`);
    }

    setIsModalOpen(false);
  };

  const handleDelete = async (cat: Category) => {
    const attachedCount = products.filter((p) => p.category === cat.id).length;
    if (confirm(`Delete "${cat.name}"? It currently has ${attachedCount} cake(s) associated.`)) {
      await deleteCategory(cat.id);
      toast.success(`Category "${cat.name}" removed.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-[#1A100C]">Bakery Cake Categories</h2>
          <p className="text-xs text-[#8C7A70]">Organize your customer storefront and bakery menu</p>
        </div>

        <Button onClick={openAddModal} variant="rose" size="sm" className="gap-1.5 shadow-soft">
          <Plus className="h-4 w-4" /> Add Category
        </Button>
      </div>

      {/* Categories Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((c) => {
          const count = products.filter((p) => p.category === c.id).length;
          let safeImg = c.image;
          if (safeImg?.includes("photo-1535141192574") || (!safeImg && c.id === "birthday")) {
            safeImg = "/images/cake-birthday.jpg";
          } else if (safeImg?.includes("photo-1518047601542") || (!safeImg && c.id === "anniversary")) {
            safeImg = "/images/cake-anniversary.jpg";
          }

          return (
            <div
              key={c.id}
              className="group overflow-hidden rounded-3xl border border-[#EFE4DB] bg-white shadow-card transition-all hover:shadow-hover"
            >
              <div className="relative h-36 w-full overflow-hidden bg-[#FAF7F2]">
                <img
                  src={safeImg}
                  alt={c.name}
                  onError={(e) => {
                    const el = e.currentTarget;
                    if (c.id === "birthday") {
                      el.src = "/images/cake-birthday.jpg";
                    } else if (c.id === "anniversary") {
                      el.src = "/images/cake-anniversary.jpg";
                    } else {
                      el.src = "/images/cake-wedding.jpg";
                    }
                  }}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-2.5 py-1 text-[0.68rem] font-bold text-[#1A100C] shadow-sm backdrop-blur-sm">
                  {count} {count === 1 ? "Cake" : "Cakes"}
                </span>
              </div>

              <div className="p-4">
                <h3 className="font-display text-base font-bold text-[#1A100C]">{c.name}</h3>
                <p className="mt-1 text-xs text-[#6B5E57] line-clamp-2 leading-relaxed min-h-[2rem]">
                  {c.blurb || "Artisan handcrafted celebration collection."}
                </p>

                <div className="mt-4 flex gap-2 border-t border-[#F2EBE5] pt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(c)}
                    className="flex-1 text-xs font-semibold border-[#EFE4DB] hover:bg-[#FAF7F2]"
                  >
                    <Edit2 className="h-3 w-3 mr-1 text-rose" /> Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(c)}
                    className="h-8 w-8 p-0 text-[#8C7A70] hover:text-red-600 hover:bg-red-50 rounded-lg"
                    title="Delete Category"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-[#EFE4DB] bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-center justify-between border-b border-[#EFE4DB] pb-4">
              <h3 className="font-display text-xl font-bold text-[#1A100C]">
                {editingCategory ? "Edit Category" : "Add Cake Category"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-2 text-[#8C7A70] hover:bg-[#FAF7F2] hover:text-[#1A100C]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {!editingCategory && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4D44] mb-1">
                    Category ID (Slug) *
                  </label>
                  <input
                    type="text"
                    required
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    placeholder="e.g. pastries"
                    className="w-full rounded-xl border border-[#EFE4DB] p-2.5 text-xs text-[#1A100C] focus:border-rose focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4D44] mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Pastries & Tarts"
                  className="w-full rounded-xl border border-[#EFE4DB] p-2.5 text-xs text-[#1A100C] focus:border-rose focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4D44] mb-1">
                  Cover Image URL
                </label>
                <input
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="/images/cake-birthday.jpg or https://..."
                  className="w-full rounded-xl border border-[#EFE4DB] p-2.5 text-xs text-[#1A100C] focus:border-rose focus:outline-none"
                />

                {/* Cover Image Preview */}
                <div className="mt-2.5 flex items-center gap-3 p-2.5 rounded-2xl bg-[#FAF7F2] border border-[#EFE4DB]">
                  <div className="h-12 w-12 rounded-xl overflow-hidden bg-white border border-[#EFE4DB] flex-shrink-0">
                    <img
                      src={image}
                      alt="Preview"
                      onError={(e) => {
                        e.currentTarget.src = "/images/cake-birthday.jpg";
                      }}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="text-[0.68rem] text-[#8C7A70] flex-1">
                    <span className="font-bold text-[#5C4D44] block">Image Preview</span>
                    <span>Local bakery photo or valid web image URL</span>
                  </div>
                </div>

                {/* Preset image buttons */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <button
                    type="button"
                    onClick={() => setImage("/images/cake-birthday.jpg")}
                    className="rounded-lg border border-[#EFE4DB] bg-white px-2 py-0.5 text-[0.68rem] font-medium text-[#5C4D44] hover:border-rose hover:text-rose transition-colors"
                  >
                    Birthday
                  </button>
                  <button
                    type="button"
                    onClick={() => setImage("/images/cake-anniversary.jpg")}
                    className="rounded-lg border border-[#EFE4DB] bg-white px-2 py-0.5 text-[0.68rem] font-medium text-[#5C4D44] hover:border-rose hover:text-rose transition-colors"
                  >
                    Anniversary
                  </button>
                  <button
                    type="button"
                    onClick={() => setImage("/images/cake-wedding.jpg")}
                    className="rounded-lg border border-[#EFE4DB] bg-white px-2 py-0.5 text-[0.68rem] font-medium text-[#5C4D44] hover:border-rose hover:text-rose transition-colors"
                  >
                    Wedding
                  </button>
                  <button
                    type="button"
                    onClick={() => setImage("/images/cake-chocolate.jpg")}
                    className="rounded-lg border border-[#EFE4DB] bg-white px-2 py-0.5 text-[0.68rem] font-medium text-[#5C4D44] hover:border-rose hover:text-rose transition-colors"
                  >
                    Chocolate
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4D44] mb-1">
                  Category Description / Blurb
                </label>
                <textarea
                  rows={2}
                  value={blurb}
                  onChange={(e) => setBlurb(e.target.value)}
                  placeholder="Fresh fruit tarts, chocolate eclairs and French mille-feuille."
                  className="w-full rounded-xl border border-[#EFE4DB] p-2.5 text-xs text-[#1A100C] focus:border-rose focus:outline-none"
                />
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
                  {editingCategory ? "Update Category" : "Save Category"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
