import { useState, type FormEvent } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { errorClass, fieldClass, labelClass, textareaClass } from "./form-styles";
import { FormSuccess } from "./FormSuccess";

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80, "Keep it under 80 characters"),
  email: z.string().trim().email("Please enter a valid email").max(255),
  phone: z
    .string()
    .trim()
    .max(16)
    .refine((v) => v === "" || /^[+\d][\d\s-]{7,15}$/.test(v), "Please enter a valid phone number"),
  message: z.string().trim().min(10, "Message should be at least 10 characters").max(1000, "Keep it under 1000 characters"),
});

const empty = { name: "", email: "", phone: "", message: "" };
type Field = keyof typeof empty;
type FieldErrors = Partial<Record<Field, string>>;

export function ContactForm() {
  const [values, setValues] = useState(empty);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [sentName, setSentName] = useState<string | null>(null);

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
    setSentName(parsed.data.name.split(" ")[0]);
    toast.success("Message sent! We'll reply soon.");
  };

  if (sentName) {
    return (
      <FormSuccess
        title={`Thanks, ${sentName}!`}
        actions={
          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              setSentName(null);
              setValues(empty);
            }}
          >
            Send another message
          </Button>
        }
      >
        Your message has been received. We'll get back to you as soon as we can.
      </FormSuccess>
    );
  }

  const err = (k: Field) => errors[k] && <p className={errorClass}>{errors[k]}</p>;

  return (
    <form onSubmit={submit} noValidate className="grid gap-5 rounded-3xl border border-border bg-card p-6 shadow-card sm:grid-cols-2 md:p-8">
      <div>
        <label htmlFor="ct-name" className={labelClass}>Name *</label>
        <input id="ct-name" value={values.name} onChange={set("name")} maxLength={80} autoComplete="name" className={fieldClass} aria-invalid={!!errors.name} />
        {err("name")}
      </div>
      <div>
        <label htmlFor="ct-email" className={labelClass}>Email *</label>
        <input id="ct-email" type="email" value={values.email} onChange={set("email")} maxLength={255} autoComplete="email" className={fieldClass} aria-invalid={!!errors.email} />
        {err("email")}
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="ct-phone" className={labelClass}>Phone (optional)</label>
        <input id="ct-phone" type="tel" value={values.phone} onChange={set("phone")} maxLength={16} autoComplete="tel" className={fieldClass} aria-invalid={!!errors.phone} />
        {err("phone")}
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="ct-message" className={labelClass}>Message *</label>
        <textarea id="ct-message" value={values.message} onChange={set("message")} maxLength={1000} rows={5} className={textareaClass} placeholder="How can we help?" aria-invalid={!!errors.message} />
        {err("message")}
      </div>
      <div className="sm:col-span-2">
        <Button type="submit" size="xl" className="w-full sm:w-auto">
          <Send /> Send Message
        </Button>
      </div>
    </form>
  );
}
