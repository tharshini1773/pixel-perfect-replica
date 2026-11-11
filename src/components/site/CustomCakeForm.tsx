import { useState, type FormEvent } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { business } from "@/config/business";
import { whatsappLink } from "@/lib/whatsapp";
import { errorClass, fieldClass, labelClass, textareaClass } from "./form-styles";
import { FormSuccess } from "./FormSuccess";

export const occasions = ["Birthday", "Wedding", "Anniversary", "Baby Shower", "Corporate", "Other"] as const;
const sizes = ["500 g", "1 kg", "1.5 kg", "2 kg", "3 kg+", "Not sure yet"] as const;

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80, "Keep it under 80 characters"),
  phone: z
    .string()
    .trim()
    .regex(/^[+\d][\d\s-]{7,15}$/, "Please enter a valid phone number"),
  occasion: z.enum(occasions, { errorMap: () => ({ message: "Choose an occasion" }) }),
  date: z.string().trim().min(1, "Choose the date you need the cake"),
  size: z.enum(sizes, { errorMap: () => ({ message: "Choose a size" }) }),
  flavour: z.string().trim().max(60, "Keep it under 60 characters").optional(),
  details: z.string().trim().min(10, "Tell us a little about your design (10+ characters)").max(800, "Keep it under 800 characters"),
});

type FormValues = z.infer<typeof schema>;
const empty = { name: "", phone: "", occasion: "", date: "", size: "", flavour: "", details: "" };
type Field = keyof typeof empty;
type FieldErrors = Partial<Record<Field, string>>;

export function CustomCakeForm({ defaultOccasion }: { defaultOccasion?: (typeof occasions)[number] }) {
  const [values, setValues] = useState({ ...empty, occasion: defaultOccasion ?? "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState<FormValues | null>(null);

  const set = (k: keyof typeof empty) => (e: { target: { value: string } }) =>
    setValues((v) => ({ ...v, [k]: e.target.value }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const errs: FieldErrors = {};
      parsed.error.issues.forEach((i) => (errs[i.path[0] as Field] = i.message));
      setErrors(errs);
      toast.error("Please check the highlighted fields");
      return;
    }
    setErrors({});
    setSubmitted(parsed.data);
    toast.success("Inquiry received! We'll be in touch soon.");
  };

  if (submitted) {
    const msg = [
      `Hello ${business.name}! Custom cake inquiry:`,
      `Name: ${submitted.name}`,
      `Phone: ${submitted.phone}`,
      `Occasion: ${submitted.occasion}`,
      `Date: ${submitted.date}`,
      `Size: ${submitted.size}`,
      submitted.flavour ? `Flavour: ${submitted.flavour}` : "",
      `Design: ${submitted.details}`,
    ]
      .filter(Boolean)
      .join("\n");
    return (
      <FormSuccess
        title={`Thank you, ${submitted.name.split(" ")[0]}!`}
        actions={
          <>
            <Button asChild variant="whatsapp" size="lg">
              <a href={whatsappLink(msg)} target="_blank" rel="noopener noreferrer">
                <MessageCircle /> Send on WhatsApp
              </a>
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                setSubmitted(null);
                setValues({ ...empty });
              }}
            >
              New inquiry
            </Button>
          </>
        }
      >
        We've noted your {submitted.occasion.toLowerCase()} cake idea for {submitted.date}. For the fastest reply, send
        these details to us on WhatsApp too.
      </FormSuccess>
    );
  }

  const err = (k: Field) => errors[k] && <p className={errorClass}>{errors[k]}</p>;

  return (
    <form onSubmit={submit} noValidate className="grid gap-5 rounded-3xl border border-border bg-card p-6 shadow-card sm:grid-cols-2 md:p-8">
      <div>
        <label htmlFor="cc-name" className={labelClass}>Full name *</label>
        <input id="cc-name" value={values.name} onChange={set("name")} maxLength={80} autoComplete="name" className={fieldClass} placeholder="Your name" aria-invalid={!!errors.name} />
        {err("name")}
      </div>
      <div>
        <label htmlFor="cc-phone" className={labelClass}>Phone / WhatsApp *</label>
        <input id="cc-phone" type="tel" value={values.phone} onChange={set("phone")} maxLength={16} autoComplete="tel" className={fieldClass} placeholder="+91 …" aria-invalid={!!errors.phone} />
        {err("phone")}
      </div>
      <div>
        <label htmlFor="cc-occasion" className={labelClass}>Occasion *</label>
        <select id="cc-occasion" value={values.occasion} onChange={set("occasion")} className={fieldClass} aria-invalid={!!errors.occasion}>
          <option value="">Select occasion</option>
          {occasions.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
        {err("occasion")}
      </div>
      <div>
        <label htmlFor="cc-date" className={labelClass}>Date needed *</label>
        <input id="cc-date" type="date" value={values.date} onChange={set("date")} className={fieldClass} aria-invalid={!!errors.date} />
        {err("date")}
      </div>
      <div>
        <label htmlFor="cc-size" className={labelClass}>Cake size *</label>
        <select id="cc-size" value={values.size} onChange={set("size")} className={fieldClass} aria-invalid={!!errors.size}>
          <option value="">Select size</option>
          {sizes.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        {err("size")}
      </div>
      <div>
        <label htmlFor="cc-flavour" className={labelClass}>Preferred flavour</label>
        <input id="cc-flavour" value={values.flavour} onChange={set("flavour")} maxLength={60} className={fieldClass} placeholder="Chocolate, red velvet…" />
        {err("flavour")}
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="cc-details" className={labelClass}>Design ideas *</label>
        <textarea id="cc-details" value={values.details} onChange={set("details")} maxLength={800} rows={5} className={textareaClass} placeholder="Theme, colours, number of tiers, message on cake, eggless…" aria-invalid={!!errors.details} />
        {err("details")}
      </div>
      <div className="sm:col-span-2">
        <Button type="submit" variant="rose" size="xl" className="w-full sm:w-auto">
          <Send /> Send Inquiry
        </Button>
      </div>
    </form>
  );
}
