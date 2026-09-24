import { SectionKicker } from "@/components/ui/SectionKicker";
import { benefits, home } from "@/lib/content";
import { Icon } from "@/lib/icons";

export function WhyUsSection() {
  return (
    <section id="why-us" className="bg-white px-5 py-20 md:px-12 lg:px-16">
      <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr]">
        <div>
          <SectionKicker>{home.whyUs.kicker}</SectionKicker>
          <h2 className="font-serif text-5xl leading-tight tracking-[-0.03em]">
            {home.whyUs.title}
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[#061a34]/65">
            {home.whyUs.description}
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {benefits.items.map((benefit) => (
            <article
              key={benefit.title}
              className="interactive-card rounded-3xl bg-(--section-bg) p-7 shadow-[0_18px_40px_rgba(6,26,52,0.05)]"
            >
              <Icon
                name={benefit.icon}
                size={38}
                strokeWidth={1.4}
                className="interactive-card-icon text-[#c89750]"
              />
              <h3 className="mt-6 font-serif text-2xl leading-tight">
                {benefit.title}
              </h3>
              <p className="mt-4 text-sm leading-7 text-[#061a34]/60">
                {benefit.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
