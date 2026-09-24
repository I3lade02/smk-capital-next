import type { Metadata } from "next";

import { ContactSection } from "@/components/sections/ContactSection";
import { ContractReviewSection } from "@/components/sections/ContractReviewSection";
import { PageHero, PageHeroLogoMedia } from "@/components/ui/PageHero";
import { SectionKicker } from "@/components/ui/SectionKicker";
import { ServiceCategoryCard } from "@/components/ui/ServiceCategoryCard";
import { processContent, services } from "@/lib/content";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: services.seo.title,
  description: services.seo.description,
  path: "/sluzby",
});

export default function ServicesPage() {
  return (
    <>
      <PageHero
        kicker={services.hero.kicker}
        title={services.hero.title}
        description={services.hero.description}
        media={<PageHeroLogoMedia />}
      />

      <section className="bg-[var(--section-bg)] px-5 py-20 md:px-12 lg:px-16">
        <div className="mb-12 max-w-3xl">
          <SectionKicker>{services.listSection.kicker}</SectionKicker>
          <h2 className="font-serif text-5xl tracking-[-0.03em]">
            {services.listSection.title}
          </h2>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          {services.categories.map((service) => (
            <ServiceCategoryCard key={service.title} service={service} />
          ))}
        </div>
      </section>

      <ContractReviewSection />

      <section className="bg-white px-5 py-20 md:px-12 lg:px-16">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <SectionKicker>{services.processSection.kicker}</SectionKicker>
            <h2 className="font-serif text-5xl leading-tight tracking-[-0.03em]">
              {services.processSection.title}
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {processContent.steps.map((step) => (
              <div
                key={step.number}
                className="interactive-card rounded-3xl border border-[#061a34]/10 p-7"
              >
                <p className="font-serif text-4xl text-[#c89750]">
                  {step.number}
                </p>
                <h3 className="mt-6 font-serif text-2xl">{step.title}</h3>
                <p className="mt-4 text-sm leading-6 text-[#061a34]/60">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ContactSection />
    </>
  );
}
