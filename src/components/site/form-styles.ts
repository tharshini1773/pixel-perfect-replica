/** Shared field styling for site forms, built from design tokens. */
export const fieldClass =
  "h-12 w-full rounded-xl border border-input bg-card px-4 text-[0.95rem] text-foreground shadow-none transition-colors placeholder:text-muted-foreground/70 focus-visible:border-rose focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40";
export const textareaClass = `${fieldClass} h-auto min-h-28 py-3 leading-relaxed`;
export const labelClass = "mb-1.5 block text-sm font-semibold text-primary";
export const errorClass = "mt-1.5 text-xs font-medium text-destructive";
