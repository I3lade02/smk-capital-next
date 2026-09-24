import type { Metadata } from "next";

import { ContractReviewForm } from "@/components/forms/ContractReviewForm";
import { HeroInfoCards, ProcessCards } from "@/components/ui/InfoCards";
import { SectionKicker } from "@/components/ui/SectionKicker";
import { contractReview } from "@/lib/content";
import { Icon } from "@/lib/icons";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: contractReview.seo.title,
  description: contractReview.seo.description,
  path: "/revize-smluv",
});

export default function ContractReviewPage() {
  const { hero, pageSteps } = contractReview;

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

            <ul className="mt-8 grid gap-3 text-sm leading-6 text-[#061a34]/70 sm:grid-cols-2">
              {hero.benefits.map((benefit) => (
                <li key={benefit} className="flex gap-3">
                  <Icon
                    name="CircleCheck"
                    size={18}
                    strokeWidth={2.1}
                    className="mt-0.5 shrink-0 text-[#c89750]"
                  />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="min-w-0">
            <ContractReviewForm />
          </div>
        </div>
      </section>

      <section className="bg-[var(--section-bg)] px-5 py-16 md:px-12 lg:px-16">
        <ProcessCards items={pageSteps} className="grid gap-6 lg:grid-cols-3" />
      </section>
    </>
  );
}
