import { useState, type FormEvent } from "react";
import { Plus, Tag, Calendar, Percent, IndianRupee, Trash2, Edit2, CheckCircle2 } from "lucide-react";
import { useBakeryStore, type Offer } from "@/context/BakeryStoreContext";
import { formatINR } from "@/config/products";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function OffersTab() {
  const { offers, addOffer, updateOffer, deleteOffer, toggleOfferActive } = useBakeryStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);

  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState("10");
  const [bannerText, setBannerText] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]!);
  const [endDate, setEndDate] = useState("2026-12-31");
  const [isActive, setIsActive] = useState(true);

  const openAdd = () => {
    setEditingOffer(null);
    setTitle("");
    setCode("");
    setDiscountType("percentage");
    setDiscountValue("15");
    setBannerText("Special Festive Offer: 15% OFF on celebration cakes!");
    setStartDate(new Date().toISOString().split("T")[0]!);
    setEndDate("2026-12-31");
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEdit = (off: Offer) => {
    setEditingOffer(off);
    setTitle(off.title);
    setCode(off.code || "");
    setDiscountType(off.discountType);
    setDiscountValue(off.discountType === "percentage" ? off.discountPercentage.toString() : (off.discountAmount || 100).toString());
    setBannerText(off.bannerText);
    setStartDate(off.startDate || "");
    setEndDate(off.endDate || "");
    setIsActive(off.isActive);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter offer title.");
      return;
    }
    const val = Number(discountValue) || 10;

    const payload = {
      title: title.trim(),
      code: code.trim().toUpperCase() || undefined,
      discountType,
      discountPercentage: discountType === "percentage" ? val : 0,
      discountAmount: discountType === "fixed" ? val : undefined,
      bannerText: bannerText.trim(),
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      isActive,
    };

    if (editingOffer) {
      await updateOffer(editingOffer.id, payload);
      toast.success(`Offer "${title}" updated!`);
    } else {
      await addOffer(payload);
      toast.success(`Offer "${title}" launched!`);
    }

    setIsModalOpen(false);
  };

  const handleDelete = async (off: Offer) => {
    if (confirm(`Delete offer "${off.title}"?`)) {
      await deleteOffer(off.id);
      toast.success(`Offer removed.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-[#1A100C]">Promotional Offers & Discount Banners</h2>
          <p className="text-xs text-[#8C7A70]">Control promotional banner announcements and customer checkout discount codes</p>
        </div>

        <Button onClick={openAdd} variant="rose" size="sm" className="gap-1.5 shadow-soft">
          <Plus className="h-4 w-4" /> Create Offer
        </Button>
      </div>

      {/* Offers List */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {offers.map((off) => (
          <div
            key={off.id}
            className="rounded-3xl border border-[#EFE4DB] bg-white p-6 shadow-card space-y-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[0.68rem] font-bold uppercase tracking-wider ${
                    off.isActive
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-gray-100 text-gray-500 border border-gray-200"
                  }`}
                >
                  {off.isActive ? "Active on Website" : "Inactive / Draft"}
                </span>
                <span className="font-mono text-xs font-bold text-rose bg-rose/10 px-2 py-0.5 rounded-lg">
                  {off.code || "NO CODE"}
                </span>
              </div>

              <h3 className="font-display text-base font-bold text-[#1A100C] mt-3">{off.title}</h3>

              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="font-display text-2xl font-bold text-[#1A100C]">
                  {off.discountType === "percentage" ? `${off.discountPercentage}% OFF` : `₹${off.discountAmount} OFF`}
                </span>
                <span className="text-[0.7rem] text-[#8C7A70]">
                  {off.discountType === "percentage" ? "Percentage discount" : "Flat instant discount"}
                </span>
              </div>

              <div className="mt-3 rounded-2xl bg-[#FAF7F2] p-3 text-xs text-[#5C4D44] border border-[#EFE4DB] leading-relaxed">
                <p className="font-bold text-[0.68rem] uppercase tracking-wider text-[#8C7A70] mb-0.5">Banner Text</p>
                {off.bannerText}
              </div>

              <p className="mt-3 text-[0.7rem] text-[#8C7A70] flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-rose" /> Valid: {off.startDate} to {off.endDate}
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-[#F2EBE5] pt-4 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleOfferActive(off.id)}
                className="text-xs font-semibold"
              >
                {off.isActive ? "Deactivate" : "Activate"}
              </Button>

              <div className="flex gap-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEdit(off)}
                  className="h-8 w-8 p-0 text-[#5C4D44] hover:bg-[#FAF7F2]"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(off)}
                  className="h-8 w-8 p-0 text-[#8C7A70] hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Offer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-[#EFE4DB] bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-center justify-between border-b border-[#EFE4DB] pb-4">
              <h3 className="font-display text-xl font-bold text-[#1A100C]">
                {editingOffer ? "Edit Promotional Offer" : "Create New Discount Offer"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="rounded-full p-2 text-[#8C7A70]">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4D44] mb-1">
                  Offer Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Weekend Birthday Special"
                  className="w-full rounded-xl border border-[#EFE4DB] p-2.5 text-xs text-[#1A100C] focus:border-rose focus:outline-none"
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
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. CAKE15"
                    className="w-full rounded-xl border border-[#EFE4DB] p-2.5 text-xs font-mono uppercase text-[#1A100C] focus:border-rose focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4D44] mb-1">
                    Discount Type
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full rounded-xl border border-[#EFE4DB] p-2.5 text-xs text-[#1A100C] focus:border-rose focus:outline-none"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4D44] mb-1">
                    Discount Value ({discountType === "percentage" ? "%" : "₹"}) *
                  </label>
                  <input
                    type="number"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder="15"
                    className="w-full rounded-xl border border-[#EFE4DB] p-2.5 text-xs text-[#1A100C] focus:border-rose focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4D44] mb-1">
                    End / Expiry Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-xl border border-[#EFE4DB] p-2.5 text-xs text-[#1A100C] focus:border-rose focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4D44] mb-1">
                  Website Announcement Banner Text *
                </label>
                <textarea
                  rows={2}
                  required
                  value={bannerText}
                  onChange={(e) => setBannerText(e.target.value)}
                  placeholder="Special Weekend Treat: Get 15% off all celebration cakes this weekend!"
                  className="w-full rounded-xl border border-[#EFE4DB] p-2.5 text-xs text-[#1A100C] focus:border-rose focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="offer-active"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-[#EFE4DB] text-rose accent-rose"
                />
                <label htmlFor="offer-active" className="text-xs font-bold text-[#5C4D44] cursor-pointer">
                  Activate banner immediately on customer website
                </label>
              </div>

              <div className="flex justify-end gap-3 border-t border-[#EFE4DB] pt-4 mt-6">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="rose" size="sm" className="font-bold shadow-soft">
                  {editingOffer ? "Update Offer" : "Save Offer"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
