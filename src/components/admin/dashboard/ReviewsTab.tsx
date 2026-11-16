import { useState } from "react";
import { Star, MessageSquareQuote, CheckCircle2, EyeOff, Trash2, Reply, Check } from "lucide-react";
import { useBakeryStore, type CustomerReview } from "@/context/BakeryStoreContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ReviewsTab() {
  const { reviews, updateReviewStatus, replyToReview, deleteReview } = useBakeryStore();
  const [replyingReview, setReplyingReview] = useState<CustomerReview | null>(null);
  const [replyText, setReplyText] = useState("");

  const averageRating = (
    reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1)
  ).toFixed(1);

  const handleStatus = async (id: string, status: "approved" | "pending" | "hidden") => {
    await updateReviewStatus(id, status);
    toast.success(`Review status updated to ${status}`);
  };

  const openReply = (r: CustomerReview) => {
    setReplyingReview(r);
    setReplyText(r.reply || "");
  };

  const handleSendReply = async () => {
    if (!replyingReview) return;
    if (!replyText.trim()) {
      toast.error("Please enter a reply message.");
      return;
    }

    await replyToReview(replyingReview.id, replyText.trim());
    toast.success("Bakery reply posted!");
    setReplyingReview(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this customer review?")) {
      await deleteReview(id);
      toast.success("Review deleted.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-[#1A100C]">Customer Reviews & Testimonials</h2>
          <p className="text-xs text-[#8C7A70]">Customer feedback, star ratings, and bakery owner replies</p>
        </div>

        <div className="flex items-center gap-2 rounded-2xl border border-[#EFE4DB] bg-white px-4 py-2 shadow-card">
          <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
          <span className="font-display text-lg font-bold text-[#1A100C]">{averageRating} / 5.0</span>
          <span className="text-xs text-[#8C7A70]">({reviews.length} total reviews)</span>
        </div>
      </div>

      {/* Reviews List */}
      <div className="grid gap-6 sm:grid-cols-2">
        {reviews.map((r) => (
          <div
            key={r.id}
            className="rounded-3xl border border-[#EFE4DB] bg-white p-6 shadow-card flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`h-4 w-4 ${
                        s <= r.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"
                      }`}
                    />
                  ))}
                </div>

                <span
                  className={`rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider ${
                    r.status === "approved"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : r.status === "pending"
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {r.status}
                </span>
              </div>

              <p className="mt-3 text-xs text-[#1A100C] leading-relaxed italic">
                "{r.comment}"
              </p>

              <div className="mt-4 flex items-center justify-between border-t border-[#F2EBE5] pt-3 text-xs">
                <div>
                  <p className="font-bold text-[#1A100C]">{r.customerName}</p>
                  <p className="text-[0.7rem] text-[#8C7A70]">Cake: {r.cakeName}</p>
                </div>
                <span className="text-[0.68rem] text-[#8C7A70]">{r.date}</span>
              </div>

              {/* Bakery Owner Reply */}
              {r.reply && (
                <div className="mt-3 rounded-2xl bg-[#FAF7F2] p-3 text-xs text-[#5C4D44] border-l-4 border-rose">
                  <p className="font-bold text-[0.68rem] uppercase tracking-wider text-rose">
                    Bakery Reply (Tharshini)
                  </p>
                  <p className="mt-0.5">{r.reply}</p>
                </div>
              )}
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-[#F2EBE5] pt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => openReply(r)}
                className="text-xs font-semibold gap-1.5 border-[#EFE4DB] hover:bg-[#FAF7F2]"
              >
                <Reply className="h-3.5 w-3.5 text-rose" /> {r.reply ? "Edit Reply" : "Respond to Feedback"}
              </Button>

              <div className="flex gap-1.5">
                {r.status !== "approved" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleStatus(r.id, "approved")}
                    className="h-8 px-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50"
                  >
                    Approve
                  </Button>
                )}
                {r.status !== "hidden" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleStatus(r.id, "hidden")}
                    className="h-8 px-2 text-xs font-bold text-[#8C7A70] hover:bg-gray-100"
                  >
                    Hide
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(r.id)}
                  className="h-8 w-8 p-0 text-[#8C7A70] hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Reply Modal */}
      {replyingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-[#EFE4DB] bg-white p-6 shadow-2xl">
            <h3 className="font-display text-lg font-bold text-[#1A100C]">
              Reply to {replyingReview.customerName}
            </h3>
            <p className="text-xs text-[#8C7A70] mt-1">Review: "{replyingReview.comment}"</p>

            <div className="mt-4 space-y-4">
              <textarea
                rows={3}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Thank you so much! We are delighted you enjoyed your celebration cake..."
                className="w-full rounded-xl border border-[#EFE4DB] p-2.5 text-xs text-[#1A100C] focus:border-rose focus:outline-none"
              />

              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setReplyingReview(null)}>
                  Cancel
                </Button>
                <Button variant="rose" size="sm" onClick={handleSendReply} className="font-bold">
                  Post Reply
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
