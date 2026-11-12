import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeading } from "@/components/site/SectionHeading";
import { ContactActions, ContactDetails, MapEmbed } from "@/components/site/ContactDetails";
import { CakeEnquiryForm } from "@/components/site/CakeEnquiryForm";
import { pageMeta } from "@/lib/seo";
import { business } from "@/config/business";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: pageMeta(
      `Contact Us & Bakery Location — ${business.name}`,
      `Get in touch with ${business.name}. Call 7550362608, WhatsApp us, or send an enquiry to tharshini1773@gmail.com. Located at ${business.address}.`,
    ),
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <>
      <PageHero
        crumb="Contact Us"
        eyebrow="Get in touch"
        title="We'd love to hear from you"
        description={`Have a celebration coming up? Call us directly, chat on WhatsApp, or send an email enquiry to ${business.email}.`}
        image="https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&w=1200&q=80"
      />

      <section className="section-y container-page">
        <ContactActions className="mb-12 flex flex-wrap justify-center gap-3" />
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <ContactDetails />
          <div>
            <SectionHeading
              align="left"
              eyebrow="Online Cake Enquiry"
              title="Send Us Your Cake Request"
              description={`Fill in the details below. All enquiries are sent directly to ${business.email} and our team will get back to you promptly.`}
              className="mb-8"
            />
            <CakeEnquiryForm />
          </div>
        </div>
      </section>

      <section className="container-page pb-20 md:pb-28">
        <SectionHeading
          eyebrow="Our Shop Location"
          title="Visit our bakery in Punnaikayal"
          description={business.address}
          className="mb-10"
        />
        <MapEmbed />
      </section>
    </>
  );
}
