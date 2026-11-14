import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import {
  Tag,
  Plus,
  Edit,
  Trash2,
  Sparkles,
  Calendar,
  CheckCircle,
  XCircle,
  Percent,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useBakeryStore, type Offer } from "@/context/BakeryStoreContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/admin/offers")({
  head: () => ({
    meta: pageMeta(
      "Offer & Discount Management — Sweet Crumbs Bakery Admin",
      "Launch festive discount campaigns, promotional announcement banners, and promo codes.",
    ),
  }),
  component: AdminOffersPage,
});

function AdminOffersPage() {
  const { offers, addOffer, updateOffer, deleteOffer, toggleOfferActive } = useBakeryStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);

  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState("15");
  const [bannerText, setBannerText] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isActive, setIsActive] = useState(true);

  const resetForm = () => {
    setEditingOffer(null);
    setTitle("");
    setCode("");
    setDiscountPercentage("15");
    setBannerText("");
    setStartDate("");
    setEndDate("");
    setIsActive(true);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (o: Offer) => {
    setEditingOffer(o);
    setTitle(o.title);
    setCode(o.code || "");
    setDiscountPercentage(o.discountPercentage.toString());
    setBannerText(o.bannerText);
    setStartDate(o.startDate || "");
    setEndDate(o.endDate || "");
    setIsActive(o.isActive);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please provide an offer title.");
      return;
    }
    if (!bannerText.trim()) {
      toast.error("Please specify banner announcement text.");
      return;
    }

    const pct = Number(discountPercentage) || 10;

    if (editingOffer) {
      await updateOffer(editingOffer.id, {
        title: title.trim(),
        code: code.trim() || undefined,
        discountPercentage: pct,
        bannerText: bannerText.trim(),
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        isActive,
      });
      toast.success(`Offer "${title}" updated! Banner updated on customer site.`);
    } else {
      await addOffer({
        title: title.trim(),
        code: code.trim() || undefined,
        discountPercentage: pct,
        bannerText: bannerText.trim(),
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        isActive,
      });
      toast.success(`Promotional offer "${title}" launched!`);
    }

    setIsModalOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string, offerTitle: string) => {
    if (window.confirm(`Delete promotional campaign "${offerTitle}"?`)) {
      await deleteOffer(id);
      toast.info(`Offer "${offerTitle}" removed.`);
    }
  };

  return (
    <AdminLayout
      title="Offers & Promotional Discounts"
      subtitle="Publish customer announcements, website top banner alerts, and coupon codes."
      action={
        <Button onClick={handleOpenAdd} size="sm" variant="rose" className="shadow-soft gap-2">
          <Plus className="h-4 w-4" /> Create Offer
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Active Banner Preview Card */}
        {offers.some((o) => o.isActive) && (
          <div className="rounded-3xl border border-rose/30 bg-gradient-to-r from-rose/10 via-blush/20 to-cream/30 p-6 shadow-soft">
            <div className="flex items-center gap-2 text-xs font-bold text-rose uppercase tracking-wider mb-2">
              <Sparkles className="h-4 w-4 text-rose" />
              <span>Live Website Announcement Banner Preview</span>
            </div>
            <div className="rounded-2xl bg-rose px-5 py-3 text-center text-xs font-semibold text-white shadow-soft sm:text-sm">
              {offers.find((o) => o.isActive)?.bannerText}
            </div>
            <p className="mt-3 text-[0.7rem] text-[#6B5E57] text-center">
              This banner automatically displays at the very top of all customer-facing pages.
            </p>
          </div>
        )}

        {/* Offers Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {offers.map((o) => (
            <div
              key={o.id}
              className={`flex flex-col justify-between rounded-3xl border bg-white p-6 shadow-soft transition-all duration-300 hover:shadow-card ${
                o.isActive ? "border-rose/40" : "border-[#EFE4DB] opacity-80"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className={`rounded-full px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider ${
                      o.isActive
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {o.isActive ? "Live on Store" : "Inactive"}
                  </span>
                  <div className="flex items-center gap-1 font-display text-xl font-bold text-rose">
                    <span>{o.discountPercentage}%</span>
                    <span className="text-xs font-sans text-[#8C7A70]">OFF</span>
                  </div>
                </div>

                <h3 className="mt-4 font-display text-lg font-bold text-[#1A100C]">{o.title}</h3>
                {o.code && (
                  <div className="mt-2 inline-flex items-center gap-1 rounded-xl bg-[#FAF7F2] border border-[#EFE4DB] px-3 py-1 text-xs font-mono font-bold text-rose">
                    <Tag className="h-3 w-3" />
                    <span>CODE: {o.code}</span>
                  </div>
                )}

                <p className="mt-3 text-xs text-[#6B5E57] leading-relaxed line-clamp-3">
                  "{o.bannerText}"
                </p>

                {(o.startDate || o.endDate) && (
                  <div className="mt-4 flex items-center gap-1.5 text-[0.68rem] text-[#8C7A70]">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      {o.startDate || "Ongoing"} → {o.endDate || "Indefinite"}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-[#EFE4DB] pt-4">
                <button
                  type="button"
                  onClick={() => toggleOfferActive(o.id)}
                  className="text-xs font-semibold text-[#5C4D44] hover:text-rose transition-colors"
                >
                  {o.isActive ? "Deactivate" : "Activate"}
                </button>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleOpenEdit(o)}
                    className="h-8 p-2 text-[#5C4D44] hover:text-rose"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(o.id, o.title)}
                    className="h-8 p-2 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add / Edit Offer Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md bg-white border-[#EFE4DB] rounded-3xl p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl font-bold text-[#1A100C]">
              {editingOffer ? "Edit Promotional Offer" : "New Promotional Campaign"}
            </DialogTitle>
            <DialogDescription className="text-xs text-[#6B5E57]">
              Configure coupon discounts, active duration, and customer banner announcement.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4D44] mb-1">
                Campaign Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Wedding Season Special"
                className="w-full rounded-xl border border-[#EFE4DB] bg-[#FAF7F2] px-3.5 py-2.5 text-xs text-[#1A100C] focus:border-rose focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4D44] mb-1">
                  Coupon Code
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="SWEET15"
                  className="w-full rounded-xl border border-[#EFE4DB] bg-[#FAF7F2] px-3.5 py-2.5 text-xs font-mono text-[#1A100C] focus:border-rose focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4D44] mb-1">
                  Discount % *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="100"
                  value={discountPercentage}
                  onChange={(e) => setDiscountPercentage(e.target.value)}
                  placeholder="15"
                  className="w-full rounded-xl border border-[#EFE4DB] bg-[#FAF7F2] px-3.5 py-2.5 text-xs text-[#1A100C] focus:border-rose focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4D44] mb-1">
                Website Announcement Banner Text *
              </label>
              <textarea
                rows={3}
                required
                value={bannerText}
                onChange={(e) => setBannerText(e.target.value)}
                placeholder="🎉 Special Celebration Offer: Get 15% OFF on all handcrafted custom & wedding cakes this week! Use code SWEET15"
                className="w-full rounded-xl border border-[#EFE4DB] bg-[#FAF7F2] px-3.5 py-2.5 text-xs text-[#1A100C] focus:border-rose focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4D44] mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-xl border border-[#EFE4DB] bg-[#FAF7F2] px-3.5 py-2.5 text-xs text-[#1A100C] focus:border-rose focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4D44] mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-xl border border-[#EFE4DB] bg-[#FAF7F2] px-3.5 py-2.5 text-xs text-[#1A100C] focus:border-rose focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="active"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-[#EFE4DB] text-rose accent-rose"
              />
              <label htmlFor="active" className="text-xs font-bold text-[#1A100C] cursor-pointer">
                Publish Active Banner to Live Store
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-[#EFE4DB]">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="rose" size="sm" className="shadow-soft">
                {editingOffer ? "Save Offer" : "Launch Offer"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

