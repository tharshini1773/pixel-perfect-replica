import { useState, type FormEvent } from "react";
import {
  Plus,
  Tag,
  Calendar,
  Percent,
  IndianRupee,
  Trash2,
  Edit2,
  CheckCircle2,
  X,
  Copy,
  Check,
  AlertTriangle,
  Sparkles,
  Info,
} from "lucide-react";
import { useBakeryStore, type Offer } from "@/context/BakeryStoreContext";
import { formatINR } from "@/config/products";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function OffersTab() {
  const { offers, addOffer, updateOffer, deleteOffer, toggleOfferActive } = useBakeryStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);

  // Detail View Modal State
  const [selectedOfferForView, setSelectedOfferForView] = useState<Offer | null>(null);

  // Delete Confirmation State
  const [offerToDelete, setOfferToDelete] = useState<Offer | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState("10");
  const [bannerText, setBannerText] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]!);
  const [endDate, setEndDate] = useState("2026-12-31");
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Keep view modal in sync with live offers state
  const activeOfferInView = selectedOfferForView
    ? offers.find((o) => o.id === selectedOfferForView.id) || selectedOfferForView
    : null;

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
    setDiscountValue(
      off.discountType === "percentage"
        ? off.discountPercentage.toString()
        : (off.discountAmount || 100).toString()
    );
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
    setIsSubmitting(true);

    try {
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
        toast.success(`Offer "${title}" updated successfully!`);
      } else {
        await addOffer(payload);
        toast.success(`New offer "${title}" created and saved!`);
      }

      setIsModalOpen(false);
    } catch (err) {
      toast.error("Failed to save offer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (off: Offer) => {
    try {
      await toggleOfferActive(off.id);
      if (!off.isActive) {
        toast.success(`Offer "${off.title}" is now active on website!`);
      } else {
        toast.success(`Offer "${off.title}" has been deactivated.`);
      }
    } catch (err) {
      toast.error("Failed to update offer status.");
    }
  };

  const confirmDelete = async () => {
    if (!offerToDelete) return;
    try {
      await deleteOffer(offerToDelete.id);
      toast.success(`Offer "${offerToDelete.title}" removed permanently.`);
      setOfferToDelete(null);
      if (selectedOfferForView?.id === offerToDelete.id) {
        setSelectedOfferForView(null);
      }
    } catch (err) {
      toast.error("Failed to delete offer.");
    }
  };

  const handleCopyCode = (codeStr: string) => {
    navigator.clipboard.writeText(codeStr);
    setCopiedCode(true);
    toast.success(`Coupon code "${codeStr}" copied!`);
    setTimeout(() => setCopiedCode(false), 2000);
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
            onClick={() => setSelectedOfferForView(off)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setSelectedOfferForView(off);
              }
            }}
            className="rounded-3xl border border-[#EFE4DB] bg-white p-6 shadow-card space-y-4 flex flex-col justify-between cursor-pointer hover:shadow-lg hover:-translate-y-0.5 hover:border-rose/30 transition-all group text-left"
            title="Click to view full offer details"
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

              <h3 className="font-display text-base font-bold text-[#1A100C] mt-3 group-hover:text-rose transition-colors">
                {off.title}
              </h3>

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
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleActive(off);
                }}
                className={`text-xs font-semibold ${
                  off.isActive
                    ? "text-[#5C4D44] hover:bg-amber-50 hover:text-amber-800 hover:border-amber-200"
                    : "text-emerald-700 hover:bg-emerald-50 hover:border-emerald-200"
                }`}
              >
                {off.isActive ? "Deactivate" : "Activate"}
              </Button>

              <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    openEdit(off);
                  }}
                  className="h-8 w-8 p-0 text-[#5C4D44] hover:bg-[#FAF7F2] hover:text-rose"
                  title="Edit Offer"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOfferToDelete(off);
                  }}
                  className="h-8 w-8 p-0 text-[#8C7A70] hover:text-red-600 hover:bg-red-50"
                  title="Delete Offer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ================= POPUP 1: OFFER DETAIL VIEW ================= */}
      {activeOfferInView && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedOfferForView(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="w-full max-w-lg rounded-3xl border border-[#EFE4DB] bg-white p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#EFE4DB] pb-4">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-rose/10 text-rose">
                  <Tag className="h-5 w-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider ${
                        activeOfferInView.isActive
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-gray-100 text-gray-500 border border-gray-200"
                      }`}
                    >
                      {activeOfferInView.isActive ? "Active on Website" : "Inactive / Draft"}
                    </span>
                  </div>
                  <h3 className="font-display text-xl font-bold text-[#1A100C] mt-1">
                    {activeOfferInView.title}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedOfferForView(null)}
                className="rounded-full p-2 text-[#8C7A70] hover:bg-[#FAF7F2] hover:text-[#1A100C] transition-colors"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Discount Value & Coupon Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-5">
              <div className="rounded-2xl border border-[#EFE4DB] bg-[#FAF7F2] p-4 text-center">
                <p className="text-[0.68rem] font-bold uppercase tracking-wider text-[#8C7A70]">Discount Value</p>
                <p className="mt-1 font-display text-2xl font-bold text-[#1A100C]">
                  {activeOfferInView.discountType === "percentage"
                    ? `${activeOfferInView.discountPercentage}% OFF`
                    : `₹${activeOfferInView.discountAmount} OFF`}
                </p>
                <p className="text-[0.65rem] text-[#8C7A70]">
                  {activeOfferInView.discountType === "percentage" ? "Percentage reduction" : "Flat instant discount"}
                </p>
              </div>

              <div className="rounded-2xl border border-rose/20 bg-rose/5 p-4 text-center">
                <p className="text-[0.68rem] font-bold uppercase tracking-wider text-rose">Coupon Code</p>
                <div className="flex items-center justify-center gap-1.5 mt-1">
                  <span className="font-mono text-xl font-bold text-[#1A100C]">
                    {activeOfferInView.code || "NO CODE"}
                  </span>
                  {activeOfferInView.code && (
                    <button
                      onClick={() => handleCopyCode(activeOfferInView.code!)}
                      className="rounded p-1 text-[#8C7A70] hover:text-rose transition-colors"
                      title="Copy Code"
                    >
                      {copiedCode ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                    </button>
                  )}
                </div>
                <p className="text-[0.65rem] text-[#8C7A70]">Applied at checkout</p>
              </div>
            </div>

            {/* Banner Text Callout */}
            <div className="rounded-2xl border border-[#EFE4DB] bg-[#FAF7F2] p-4 mb-4">
              <span className="text-[0.68rem] font-bold uppercase tracking-wider text-[#8C7A70] block mb-1">
                Website Announcement Banner
              </span>
              <p className="text-xs text-[#1A100C] italic leading-relaxed">
                "{activeOfferInView.bannerText}"
              </p>
              <p className="text-[0.68rem] text-[#8C7A70] mt-2">
                Displayed in promotional announcement bars across the online storefront when active.
              </p>
            </div>

            {/* Validity Range */}
            <div className="rounded-2xl border border-[#EFE4DB] p-4 bg-white mb-6">
              <div className="flex items-center gap-2 text-xs text-[#5C4D44]">
                <Calendar className="h-4 w-4 text-rose" />
                <span className="font-bold">Validity Period:</span>
                <span>{activeOfferInView.startDate || "Ongoing"}</span>
                <span className="text-[#8C7A70]">to</span>
                <span>{activeOfferInView.endDate || "No expiration"}</span>
              </div>
              <p className="text-[0.7rem] text-[#8C7A70] mt-1 pl-6">
                Status: {activeOfferInView.isActive ? "Currently published live on customer website" : "Draft status (hidden from storefront)"}
              </p>
            </div>

            {/* Action Buttons in Detail Modal */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#EFE4DB] pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleToggleActive(activeOfferInView)}
                className={`w-full sm:w-auto text-xs font-semibold ${
                  activeOfferInView.isActive
                    ? "text-[#5C4D44] hover:bg-amber-50"
                    : "text-emerald-700 hover:bg-emerald-50"
                }`}
              >
                {activeOfferInView.isActive ? "Deactivate Offer" : "Activate on Website"}
              </Button>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedOfferForView(null);
                    openEdit(activeOfferInView);
                  }}
                  className="text-xs font-semibold gap-1.5"
                >
                  <Edit2 className="h-3.5 w-3.5" /> Edit
                </Button>
                <Button
                  variant="rose"
                  size="sm"
                  onClick={() => setSelectedOfferForView(null)}
                  className="text-xs font-bold shadow-soft"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= POPUP 2: DELETE CONFIRMATION ================= */}
      {offerToDelete && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setOfferToDelete(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="w-full max-w-md rounded-3xl border border-[#EFE4DB] bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-red-100 text-red-600">
                <Trash2 className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-display text-lg font-bold text-[#1A100C]">Delete Promotional Offer</h3>
                <p className="text-xs text-[#8C7A70]">Confirmation required</p>
              </div>
            </div>

            <p className="text-xs text-[#5C4D44] mb-6 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-[#1A100C]">"{offerToDelete.title}"</strong> ({offerToDelete.code || "NO CODE"})? This will remove the discount code and promotional banner from the website.
            </p>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F2EBE5]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOfferToDelete(null)}
                className="text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={confirmDelete}
                className="text-xs font-bold bg-red-600 hover:bg-red-700 text-white"
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ================= POPUP 3: CREATE / EDIT OFFER MODAL ================= */}
      {isModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="w-full max-w-lg rounded-3xl border border-[#EFE4DB] bg-white p-6 shadow-2xl sm:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#EFE4DB] pb-4">
              <h3 className="font-display text-xl font-bold text-[#1A100C]">
                {editingOffer ? "Edit Promotional Offer" : "Create New Discount Offer"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="rounded-full p-2 text-[#8C7A70] hover:bg-[#FAF7F2]">✕</button>
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
                <Button type="submit" variant="rose" size="sm" disabled={isSubmitting} className="font-bold shadow-soft">
                  {isSubmitting ? "Saving..." : editingOffer ? "Update Offer" : "Save Offer"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
