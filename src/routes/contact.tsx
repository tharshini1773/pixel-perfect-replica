import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeading } from "@/components/site/SectionHeading";
import { ContactActions, ContactDetails, MapEmbed } from "@/components/site/ContactDetails";
import { ContactForm } from "@/components/site/ContactForm";
import { pageMeta } from "@/lib/seo";
import cupcakes from "@/assets/cake-cupcakes.jpg";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: pageMeta(
      "Contact & Location — Sweet Crumbs Bakery",
      "Call, WhatsApp or visit Sweet Crumbs Bakery. Find our address, opening hours and directions, or send us a message.",
    ),
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <>
      <PageHero
        crumb="Contact"
        eyebrow="Contact & location"
        title="We'd love to hear from you"
        description="Questions, orders or custom ideas — call, WhatsApp, visit us or drop a message below."
        image={cupcakes}
      />

      <section className="section-y container-page">
        <ContactActions className="mb-12 flex flex-wrap justify-center gap-3" />
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <ContactDetails />
          <div>
            <SectionHeading align="left" eyebrow="Send a message" title="Drop us a line" className="mb-8" />
            <ContactForm />
          </div>
        </div>
      </section>

      <section className="container-page pb-20 md:pb-28">
        <SectionHeading eyebrow="Find us" title="Visit our bakery" className="mb-10" />
        <MapEmbed />
      </section>
    </>
  );
}
