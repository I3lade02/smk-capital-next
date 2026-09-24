import type { Metadata } from "next";

import { CarInsuranceForm } from "@/components/forms/CarInsuranceForm";
import { HeroInfoCards, ProcessCards } from "@/components/ui/InfoCards";
import { SectionKicker } from "@/components/ui/SectionKicker";
import { carInsurance } from "@/lib/content";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: carInsurance.seo.title,
  description: carInsurance.seo.description,
  path: "/autopojisteni",
});

export default function CarInsurancePage() {
  const { hero, processSection } = carInsurance;

  return (
    <>
      <section className="relative overflow-hidden bg-[var(--section-bg)] px-5 pb-16 pt-36 md:px-12 lg:px-16 lg:pt-40">
        <div className="absolute inset-x-0 top-0 h-px bg-[#c89750]/25" />
        <div className="grid items-start gap-10 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="min-w-0 pt-4 lg:sticky lg:top-28">
            <SectionKicker>{hero.kicker}</SectionKicker>

            <h1 className="max-w-3xl font-serif text-5xl leading-[0.98] tracking-[-0.04em] text-[#061a34] md:text-7xl">
              {hero.title}
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-[#061a34]/65">
              {hero.description}
            </p>

            <HeroInfoCards cards={hero.cards} />
          </div>

          <div className="min-w-0">
            <CarInsuranceForm />
          </div>
        </div>
      </section>

      <section className="bg-[var(--section-bg)] px-5 py-16 md:px-12 lg:px-16">
        <div className="mb-10 max-w-3xl">
          <SectionKicker>{processSection.kicker}</SectionKicker>
          <h2 className="font-serif text-5xl leading-tight tracking-[-0.03em] text-[#061a34]">
            {processSection.title}
          </h2>
        </div>

        <ProcessCards items={processSection.items} />
      </section>
    </>
  );
}
