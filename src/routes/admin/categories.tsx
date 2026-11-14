import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Plus, Edit, Trash2, FolderTree, Sparkles, Image as ImageIcon } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useBakeryStore, type Category } from "@/context/BakeryStoreContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/admin/categories")({
  head: () => ({
    meta: pageMeta(
      "Category Management — Sweet Crumbs Bakery Admin",
      "Organize cake categories, taxonomy, hero imagery, and customer menu filters.",
    ),
  }),
  component: AdminCategoriesPage,
});

function AdminCategoriesPage() {
  const { categories, products, addCategory, updateCategory, deleteCategory } = useBakeryStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [name, setName] = useState("");
  const [blurb, setBlurb] = useState("");
  const [image, setImage] = useState("");

  const resetForm = () => {
    setEditingCategory(null);
    setName("");
    setBlurb("");
    setImage("");
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Category) => {
    setEditingCategory(c);
    setName(c.name);
    setBlurb(c.blurb || "");
    setImage(c.image);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Category name is required.");
      return;
    }

    const catImage =
      image.trim() ||
      "https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=800&q=80";

    if (editingCategory) {
      await updateCategory(editingCategory.id, {
        name: name.trim(),
        blurb: blurb.trim(),
        image: catImage,
      });
      toast.success(`Category "${name}" updated!`);
    } else {
      const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      await addCategory({
        id,
        name: name.trim(),
        blurb: blurb.trim(),
        image: catImage,
      });
      toast.success(`New category "${name}" created!`);
    }

    setIsModalOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string, catName: string) => {
    const productsInCat = products.filter((p) => p.category === id).length;
    if (productsInCat > 0) {
      if (
        !window.confirm(
          `There are ${productsInCat} cake(s) in "${catName}". Deleting this category will unassign them. Proceed?`,
        )
      ) {
        return;
      }
    } else {
      if (!window.confirm(`Delete category "${catName}"?`)) return;
    }

    await deleteCategory(id);
    toast.info(`Category "${catName}" removed.`);
  };

  return (
    <AdminLayout
      title="Cake Category Taxonomy"
      subtitle="Organize bakery menu collections, header filters, and category showcase cards."
      action={
        <Button onClick={handleOpenAdd} size="sm" variant="rose" className="shadow-soft gap-2">
          <Plus className="h-4 w-4" /> Add Category
        </Button>
      }
    >
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => {
          const itemCount = products.filter((p) => p.category === c.id).length;

          return (
            <div
              key={c.id}
              className="flex flex-col justify-between overflow-hidden rounded-3xl border border-[#EFE4DB] bg-white shadow-soft transition-all duration-300 hover:shadow-card"
            >
              <div className="relative h-44 w-full overflow-hidden bg-[#FAF7F2]">
                <img
                  src={c.image}
                  alt={c.name}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[0.65rem] font-bold text-white backdrop-blur-md">
                  {itemCount} active cakes
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-display text-lg font-bold text-[#1A100C]">{c.name}</h3>
                  <p className="mt-1 text-xs text-[#6B5E57] leading-relaxed line-clamp-2">
                    {c.blurb || "Artisan handcrafted celebration collection."}
                  </p>
                  <p className="mt-2 font-mono text-[0.65rem] text-[#8C7A70]">Slug: /{c.id}</p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-[#EFE4DB] pt-3">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleOpenEdit(c)}
                    className="h-8 gap-1 text-xs font-semibold text-[#5C4D44] hover:text-rose"
                  >
                    <Edit className="h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(c.id, c.name)}
                    className="h-8 gap-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Category Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md bg-white border-[#EFE4DB] rounded-3xl p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl font-bold text-[#1A100C]">
              {editingCategory ? "Edit Category" : "Create New Category"}
            </DialogTitle>
            <DialogDescription className="text-xs text-[#6B5E57]">
              Define category naming, description, and hero preview picture.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4D44] mb-1">
                Category Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Birthday Cakes"
                className="w-full rounded-xl border border-[#EFE4DB] bg-[#FAF7F2] px-3.5 py-2.5 text-xs text-[#1A100C] focus:border-rose focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4D44] mb-1">
                Blurb / Tagline
              </label>
              <input
                type="text"
                value={blurb}
                onChange={(e) => setBlurb(e.target.value)}
                placeholder="Bright, joyful celebrations with candles & sprinkles"
                className="w-full rounded-xl border border-[#EFE4DB] bg-[#FAF7F2] px-3.5 py-2.5 text-xs text-[#1A100C] focus:border-rose focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4D44] mb-1">
                Hero Photo URL
              </label>
              <input
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full rounded-xl border border-[#EFE4DB] bg-[#FAF7F2] px-3.5 py-2.5 text-xs text-[#1A100C] focus:border-rose focus:outline-none"
              />
              {image && (
                <div className="mt-2 flex items-center gap-2">
                  <img src={image} alt="Preview" className="h-10 w-10 rounded-lg object-cover" />
                  <span className="text-[0.65rem] text-[#6B5E57]">Preview loaded</span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-[#EFE4DB]">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="rose" size="sm" className="shadow-soft">
                {editingCategory ? "Update Category" : "Create Category"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

