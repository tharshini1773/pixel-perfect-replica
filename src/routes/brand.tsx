import { createFileRoute } from "@tanstack/react-router";
import { Check, Copy, Download, Layers, Palette, Sparkles, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeading } from "@/components/site/SectionHeading";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/brand")({
  head: () => ({
    meta: pageMeta(
      "Brand Identity & Logo System — Sweet Crumbs Bakery",
      "Official brand identity, vector SVG logos, app favicons, color palette, and typography guidelines for Sweet Crumbs Bakery.",
    ),
  }),
  component: BrandPage,
});

const logoVariants = [
  {
    id: "main",
    title: "1. Main Brand Logo",
    subtitle: "Horizontal lockup with bespoke emblem and Fraunces serif wordmark",
    file: "/logo.svg",
    bg: "bg-white",
    border: "border-border",
    badge: "Primary Identity",
  },
  {
    id: "icon",
    title: "2. Icon-Only Favicon & App Icon",
    subtitle: "High-contrast scalable emblem for browser tabs, mobile apps & social avatars",
    file: "/favicon.svg",
    bg: "bg-[#FAF7F2]",
    border: "border-border",
    badge: "App Icon / Favicon",
    previewClass: "h-20 w-20",
  },
  {
    id: "light",
    title: "3. Light-Background Version",
    subtitle: "Optimized on warm cream / milk-white canvas for print & marketing",
    file: "/logo-light.svg",
    bg: "bg-[#FBF8F5]",
    border: "border-[#EFE4DB]",
    badge: "Light Canvas",
  },
  {
    id: "dark",
    title: "4. Dark-Background Version",
    subtitle: "High-contrast formulation on deep obsidian cocoa for dark mode & footers",
    file: "/logo-dark.svg",
    bg: "bg-[#1A100C]",
    border: "border-[#331E17]",
    badge: "Dark Mode / Footer",
    darkText: true,
  },
  {
    id: "transparent",
    title: "5. Transparent-Background Version",
    subtitle: "Pure vector geometry for overlaying on packaging, photography & gradients",
    file: "/logo-transparent.svg",
    bg: "bg-gradient-to-r from-rose/15 via-cream/40 to-blush/20",
    border: "border-rose/20",
    badge: "Transparent Overlay",
  },
];

const colorTokens = [
  { name: "Velvet Rose", hex: "#E85D75", role: "Primary Accent & Emblem Gradient Top", textColor: "text-white" },
  { name: "Ruby Carmine", hex: "#C23854", role: "Emblem Mid-tone & Subtitle", textColor: "text-white" },
  { name: "Deep Berry", hex: "#8F1D35", role: "Emblem Shadow Anchor", textColor: "text-white" },
  { name: "Celebration Gold", hex: "#F5C362", role: "Star Spark & Artisan Crumbs", textColor: "text-cocoa" },
  { name: "Obsidian Cocoa", hex: "#1A100C", role: "Dark Canvas & Deep Foundation", textColor: "text-white" },
  { name: "Milk Cream", hex: "#FFFDFB", role: "Cake Frosting & Light Canvas", textColor: "text-cocoa" },
];

function BrandPage() {
  const [copied, setCopied] = useState<string | null>(null);

  const handleDownload = (file: string, filename: string) => {
    if (typeof window === "undefined") return;
    const link = document.createElement("a");
    link.href = file;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyUrl = (path: string, id: string) => {
    if (typeof window === "undefined") return;
    navigator.clipboard.writeText(window.location.origin + path);
    setCopied(id);
    setTimeout(() => setCopied(null), 2500);
  };

  return (
    <>
      <PageHero
        crumb="Brand Identity"
        eyebrow="Design System"
        title="Bespoke Brand Identity & Logos"
        description="A polished, production-ready brand identity designed with a modern startup aesthetic for Sweet Crumbs Bakery."
        image="/logo-dark.svg"
      />

      <section className="section-y container-page">
        <SectionHeading
          eyebrow="Deliverables Showcase"
          title="5 Official Brand Variants"
          description="Every asset is crafted as clean, resolution-independent vector SVG scalable from a 16px browser favicon up to large-format displays."
        />

        <div className="mt-14 grid gap-8 md:grid-cols-2">
          {logoVariants.map((v) => (
            <div
              key={v.id}
              className="flex flex-col justify-between overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition-all duration-300 hover:shadow-card"
            >
              {/* Preview Canvas */}
              <div
                className={`relative flex min-h-[200px] items-center justify-center p-8 sm:min-h-[240px] ${v.bg} border-b ${v.border}`}
              >
                <img
                  src={v.file}
                  alt={v.title}
                  className={`max-w-[280px] object-contain transition-transform duration-300 hover:scale-105 ${v.previewClass || "w-full"}`}
                />
                <span className="absolute left-4 top-4 rounded-full bg-black/60 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-white backdrop-blur-md">
                  {v.badge}
                </span>
              </div>

              {/* Asset Info & Actions */}
              <div className="p-6">
                <h3 className="font-display text-xl font-bold text-primary">{v.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{v.subtitle}</p>

                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    variant="rose"
                    className="shadow-soft gap-1.5"
                    onClick={() => handleDownload(v.file, `sweet-crumbs-${v.id}.svg`)}
                  >
                    <Download className="h-3.5 w-3.5" /> Download SVG
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyUrl(v.file, v.id)}
                    className="gap-1.5"
                  >
                    {copied === v.id ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-whatsapp" /> Link Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" /> Copy Asset URL
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {/* Favicon Scalability Matrix Card */}
          <div className="flex flex-col justify-between overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-soft md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary text-rose">
                <Layers className="h-6 w-6" />
              </span>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-rose">
                  Multi-Resolution Testing
                </span>
                <h3 className="font-display text-2xl font-bold text-primary">
                  Favicon & App Icon Scalability Matrix
                </h3>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-8 max-w-2xl">
              The emblem is mathematically optimized with thick vector profiles and crisp contrast so it remains punchy and instantly recognizable at standard browser tab and mobile resolutions.
            </p>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { size: 16, label: "16x16 px", use: "Standard Browser Tab" },
                { size: 32, label: "32x32 px", use: "Retina / Bookmark Bar" },
                { size: 64, label: "64x64 px", use: "PWA Taskbar / Shortcut" },
                { size: 128, label: "128x128 px", use: "Mobile App Icon / Avatar" },
              ].map((m) => (
                <div key={m.size} className="flex flex-col items-center rounded-2xl bg-secondary/50 p-5 text-center border border-border/60">
                  <div className="grid place-items-center h-24">
                    <img
                      src="/favicon.svg"
                      alt={`${m.size}px preview`}
                      style={{ width: `${m.size}px`, height: `${m.size}px` }}
                      className="rounded-[22%] shadow-sm"
                    />
                  </div>
                  <span className="font-display text-base font-bold text-primary mt-3">{m.label}</span>
                  <span className="text-[0.68rem] text-muted-foreground mt-0.5">{m.use}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Brand Palette */}
      <section className="section-y bg-gradient-blush">
        <div className="container-page">
          <SectionHeading
            eyebrow="Color Architecture"
            title="Balanced Artisanal Palette"
            description="Warm, culinary-inspired tones engineered for harmonious visual hierarchy across physical packaging and digital interfaces."
          />

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {colorTokens.map((c) => (
              <div key={c.hex} className="flex items-center gap-4 rounded-3xl border border-border bg-card p-4 shadow-soft">
                <span
                  className="h-14 w-14 shrink-0 rounded-2xl shadow-inner border border-black/10"
                  style={{ backgroundColor: c.hex }}
                />
                <div className="min-w-0">
                  <h4 className="font-display text-base font-bold text-primary">{c.name}</h4>
                  <p className="font-mono text-xs text-rose font-semibold">{c.hex}</p>
                  <p className="text-[0.72rem] text-muted-foreground mt-0.5 truncate">{c.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
