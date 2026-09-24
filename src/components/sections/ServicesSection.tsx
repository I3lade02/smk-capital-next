"use client";

import { IconArrowRight } from "@tabler/icons-react";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { SectionKicker } from "@/components/ui/SectionKicker";
import { home, services } from "@/lib/content";
import { Icon } from "@/lib/icons";
import { scrollToSectionFromHref } from "@/lib/sectionLinks";
import { assetPath } from "@/lib/paths";

const contactHref = "#contact";

export function ServicesSection() {
  const { servicesIntro } = home;

  return (
    <section
      id="services"
      className="relative bg-(--section-bg) px-5 pb-20 md:px-12 lg:px-16"
    >
      <div className="grid gap-8 xl:grid-cols-[300px_1fr]">
        <div className="interactive-card overflow-hidden rounded-[28px] rounded-tr-[90px] bg-white shadow-[0_25px_70px_rgba(6,26,52,0.1)]">
          <img
            src={assetPath(servicesIntro.image)}
            alt={servicesIntro.imageAlt}
            className="h-72 w-full object-cover object-[center_70%]"
          />

          <div className="p-8">
            <SectionKicker>{servicesIntro.kicker}</SectionKicker>
            <h2 className="font-serif text-4xl leading-tight">
              {servicesIntro.title}
            </h2>
            <p className="mt-5 text-sm leading-7 text-[#061a34]/60">
              {servicesIntro.description}
            </p>

            <Link
              href="/sluzby"
              className="interactive-link mt-8 inline-flex items-center gap-3 text-sm font-semibold text-[#c89750]"
            >
              {servicesIntro.linkLabel}
              <IconArrowRight size={16} />
            </Link>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {services.categories.map((service) => (
            <a
              key={service.number}
              href={contactHref}
              onClick={(event) => scrollToSectionFromHref(event, contactHref)}
              className="interactive-card group block rounded-3xl bg-white p-8 shadow-[0_22px_55px_rgba(6,26,52,0.1)] transition duration-300 hover:-translate-y-2 hover:shadow-[0_30px_75px_rgba(6,26,52,0.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c89750]/45 focus-visible:ring-offset-4 focus-visible:ring-offset-(--section-bg)"
            >
              <p className="font-serif text-2xl text-[#c89750]">
                {service.number}
              </p>

              <Icon
                name={service.icon}
                className="interactive-card-icon mt-8 text-[#c89750]"
                size={42}
                strokeWidth={1.4}
              />

              <h3 className="mt-7 font-serif text-2xl leading-tight">
                {service.title}
              </h3>

              <p className="mt-4 text-sm leading-6 text-[#061a34]/60">
                {service.description}
              </p>

              <ul className="mt-6 space-y-3 text-sm leading-6 text-[#061a34]/70">
                {service.items.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 block h-1.5 w-1.5 rounded-full bg-[#c89750]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </a>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {services.quickActions.map((action) => (
          <article
            key={action.title}
            className={
              action.highlighted
                ? "interactive-card rounded-3xl bg-[#061a34] p-8 text-white shadow-[0_24px_65px_rgba(6,26,52,0.18)]"
                : "interactive-card rounded-3xl bg-white p-8 shadow-[0_22px_55px_rgba(6,26,52,0.09)]"
            }
          >
            <Icon
              name={action.icon}
              size={40}
              strokeWidth={1.4}
              className={
                action.highlighted
                  ? "interactive-card-icon text-[#f1c47d]"
                  : "interactive-card-icon text-[#c89750]"
              }
            />
            <h3
              className={
                action.highlighted
                  ? "mt-7 font-serif text-3xl leading-tight text-white"
                  : "mt-7 font-serif text-3xl leading-tight"
              }
            >
              {action.title}
            </h3>
            <p
              className={
                action.highlighted
                  ? "mt-4 text-sm leading-7 text-white/70"
                  : "mt-4 text-sm leading-7 text-[#061a34]/60"
              }
            >
              {action.description}
            </p>

            <Button
              href={action.href}
              variant={action.highlighted ? "secondary" : "primary"}
              className={
                action.highlighted
                  ? "mt-8 border-white/20 text-white hover:bg-white/10"
                  : "mt-8"
              }
            >
              {action.label}
            </Button>
          </article>
        ))}
      </div>
    </section>
  );
}
