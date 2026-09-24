import type { Metadata } from "next";

import { AboutVideoSection } from "@/components/sections/AboutVideoSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { PageHero } from "@/components/ui/PageHero";
import { SectionKicker } from "@/components/ui/SectionKicker";
import { about, benefits, home, site } from "@/lib/content";
import { Icon } from "@/lib/icons";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: about.seo.title,
  description: about.seo.description,
  path: "/o-nas",
});

const contactItems = [
  {
    label: about.contactSection.phoneLabel,
    value: site.phone,
    href: site.phoneHref,
    icon: "Phone",
  },
  {
    label: about.contactSection.emailLabel,
    value: site.email,
    href: site.emailHref,
    icon: "Mail",
  },
  ...(site.address.length > 0
    ? [
        {
          label: about.contactSection.addressLabel,
          value: site.address.join(", "),
          href: undefined,
          icon: "MapPin",
        },
      ]
    : []),
  {
    label: about.contactSection.availabilityLabel,
    value: site.availability,
    href: undefined,
    icon: "ClockHour3",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        kicker={about.hero.kicker}
        title={about.hero.title}
        description={about.hero.description}
        media={
          <div className="rounded-[28px] rounded-tl-[110px] bg-[#061a34] px-8 py-12 text-white shadow-[0_30px_80px_rgba(6,26,52,0.14)] md:px-12 md:py-14">
            <p className="font-serif text-4xl leading-tight text-[#d7b174] md:text-5xl">
              {about.hero.mediaTitle}
            </p>
            <p className="mt-7 text-sm font-bold uppercase tracking-[0.28em] text-white/55">
              {about.hero.mediaSubtitle}
            </p>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {about.hero.watchedAreas.map((item) => (
                <li key={item} className="flex items-center gap-3 text-lg">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#c89750]/15 text-[#d7b174]">
                    <Icon name="Check" size={17} strokeWidth={2.5} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        }
      />

      <section className="bg-white px-5 py-20 md:px-12 lg:px-16">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <SectionKicker>{about.whoWeAre.kicker}</SectionKicker>
            <h2 className="font-serif text-5xl leading-tight tracking-[-0.03em]">
              {about.whoWeAre.title}
            </h2>

            <div className="mt-8 flex flex-wrap gap-3">
              {home.about.highlights.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-[#061a34]/10 bg-(--section-bg) px-4 py-2 text-sm text-[#061a34]/70"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-6 text-lg leading-8 text-[#061a34]/65">
            {home.about.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-20 md:px-12 lg:px-16">
        <div className="mb-12 max-w-3xl">
          <SectionKicker>{about.benefitsSection.kicker}</SectionKicker>
          <h2 className="font-serif text-5xl leading-tight tracking-[-0.03em]">
            {about.benefitsSection.title}
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {benefits.items.map((benefit) => (
            <article
              key={benefit.title}
              className="interactive-card rounded-3xl bg-[var(--section-bg)] p-8 shadow-[0_22px_55px_rgba(6,26,52,0.08)]"
            >
              <Icon
                name={benefit.icon}
                size={40}
                strokeWidth={1.4}
                className="interactive-card-icon text-[#c89750]"
              />
              <h3 className="mt-7 font-serif text-3xl leading-tight">
                {benefit.title}
              </h3>
              <p className="mt-4 leading-7 text-[#061a34]/60">
                {benefit.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <AboutVideoSection />

      <section className="bg-white px-5 py-20 md:px-12 lg:px-16">
        <div className="mb-12 max-w-3xl">
          <SectionKicker>{about.contactSection.kicker}</SectionKicker>
          <h2 className="font-serif text-5xl tracking-[-0.03em]">
            {about.contactSection.title}
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {contactItems.map((item) => (
            <article
              key={item.label}
              className="interactive-card rounded-3xl bg-(--section-bg) p-8"
            >
              <Icon
                name={item.icon}
                size={42}
                strokeWidth={1.4}
                className="interactive-card-icon text-[#c89750]"
              />
              <h3 className="mt-6 font-serif text-2xl">{item.label}</h3>
              {item.href ? (
                <a
                  href={item.href}
                  className="mt-4 block break-words text-lg font-semibold leading-7 text-[#061a34] transition hover:text-[#c89750] md:text-xl"
                >
                  {item.value}
                </a>
              ) : (
                <p className="mt-4 break-words text-lg font-semibold leading-7 text-[#061a34] md:text-xl">
                  {item.value}
                </p>
              )}
            </article>
          ))}
        </div>
      </section>

      <ContactSection />
    </>
  );
}
