import { useState, type FormEvent } from "react";
import { z } from "zod";
import { Minus, Phone, Plus, MessageCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatINR, getCategoryName, type Product } from "@/config/products";
import { buildOrderMessage, telLink, whatsappLink } from "@/lib/whatsapp";
import { fieldClass, labelClass, textareaClass, errorClass } from "./form-styles";

const orderSchema = z.object({
  quantity: z.number().int().min(1, "At least 1").max(20, "For more than 20, please call us"),
  name: z.string().trim().max(80, "Keep it under 80 characters").optional(),
  date: z.string().trim().max(20).optional(),
  cakeMessage: z.string().trim().max(40, "Keep the cake message under 40 characters").optional(),
  notes: z.string().trim().max(300, "Keep notes under 300 characters").optional(),
});

type OrderField = keyof z.infer<typeof orderSchema>;
type FieldErrors = Partial<Record<OrderField, string>>;

type Props = { product: Product | null; onOpenChange: (open: boolean) => void };

export function OrderDialog({ product, onOpenChange }: Props) {
  const [quantity, setQuantity] = useState(1);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [cakeMessage, setCakeMessage] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setQuantity(1);
      setName("");
      setDate("");
      setCakeMessage("");
      setNotes("");
      setErrors({});
    }
    onOpenChange(open);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!product) return;
    const parsed = orderSchema.safeParse({ quantity, name, date, cakeMessage, notes });
    if (!parsed.success) {
      const errs: FieldErrors = {};
      parsed.error.issues.forEach((i) => (errs[i.path[0] as OrderField] = i.message));
      setErrors(errs);
      return;
    }
    setErrors({});
    window.open(whatsappLink(buildOrderMessage(product, parsed.data)), "_blank", "noopener,noreferrer");
  };

  return (
    <Dialog open={!!product} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto rounded-3xl border-border bg-background p-0 sm:max-w-xl">
        {product && (
          <form onSubmit={submit} noValidate>
            <div className="flex gap-4 border-b border-border bg-gradient-blush p-5 sm:p-6">
              <img
                src={product.image}
                alt={product.name}
                width={1024}
                height={1024}
                className="h-24 w-24 shrink-0 rounded-2xl object-cover shadow-soft sm:h-28 sm:w-28"
              />
              <DialogHeader className="space-y-1 text-left">
                <span className="eyebrow">{getCategoryName(product.category)}</span>
                <DialogTitle className="font-display text-2xl font-medium text-primary">{product.name}</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  {product.weight} · <span className="font-semibold text-primary">{formatINR(product.price)}</span>
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
              <div>
                <span className={labelClass}>Quantity</span>
                <div className="flex h-12 items-center justify-between rounded-xl border border-input bg-card px-2">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="grid h-8 w-8 place-items-center rounded-full bg-secondary text-primary hover:bg-accent"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="font-semibold text-primary" aria-live="polite">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                    className="grid h-8 w-8 place-items-center rounded-full bg-secondary text-primary hover:bg-accent"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                {errors.quantity && <p className={errorClass}>{errors.quantity}</p>}
              </div>
              <div>
                <label htmlFor="order-date" className={labelClass}>Needed on</label>
                <input id="order-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className={fieldClass} />
              </div>
              <div>
                <label htmlFor="order-name" className={labelClass}>Your name</label>
                <input id="order-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} placeholder="e.g. Priya" className={fieldClass} />
                {errors.name && <p className={errorClass}>{errors.name}</p>}
              </div>
              <div>
                <label htmlFor="order-msg" className={labelClass}>Message on cake</label>
                <input id="order-msg" value={cakeMessage} onChange={(e) => setCakeMessage(e.target.value)} maxLength={40} placeholder="Happy Birthday Anu!" className={fieldClass} />
                {errors.cakeMessage && <p className={errorClass}>{errors.cakeMessage}</p>}
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="order-notes" className={labelClass}>Notes (optional)</label>
                <textarea id="order-notes" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={300} placeholder="Eggless, delivery address, colour preference…" className={textareaClass} />
                {errors.notes && <p className={errorClass}>{errors.notes}</p>}
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <p className="text-sm text-muted-foreground">
                Total <span className="ml-1 font-display text-2xl font-semibold text-primary">{formatINR(product.price * quantity)}</span>
              </p>
              <div className="flex gap-2">
                <Button asChild type="button" variant="outline" size="lg">
                  <a href={telLink()}>
                    <Phone /> Call
                  </a>
                </Button>
                <Button type="submit" variant="whatsapp" size="lg" className="flex-1 sm:flex-none">
                  <MessageCircle /> Order on WhatsApp
                </Button>
              </div>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
