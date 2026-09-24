"use client";

import { Icon } from "@/lib/icons";
import type { ServiceCategory } from "@/lib/content";
import { scrollToSectionFromHref } from "@/lib/sectionLinks";

const contactHref = "#contact";

/** Velká karta služby na stránce /sluzby – po kliknutí sjede na formulář. */
export function ServiceCategoryCard({ service }: { service: ServiceCategory }) {
  return (
    <a
      href={contactHref}
      onClick={(event) => scrollToSectionFromHref(event, contactHref)}
      className="interactive-card group block rounded-3xl bg-white p-8 shadow-[0_22px_55px_rgba(6,26,52,0.09)] transition hover:-translate-y-1 hover:shadow-[0_30px_75px_rgba(6,26,52,0.15)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c89750]/45 focus-visible:ring-offset-4 focus-visible:ring-offset-(--section-bg)"
    >
      <div className="flex items-start justify-between gap-6">
        <p className="font-serif text-3xl text-[#c89750]">{service.number}</p>
        <Icon
          name={service.icon}
          size={42}
          strokeWidth={1.4}
          className="interactive-card-icon text-[#c89750]"
        />
      </div>

      <h3 className="mt-8 font-serif text-3xl">{service.title}</h3>

      <p className="mt-4 leading-7 text-[#061a34]/60">{service.description}</p>

      <ul className="mt-7 space-y-3 text-sm text-[#061a34]/70">
        {service.items.map((item) => (
          <li key={item} className="flex gap-3">
            <Icon
              name="CircleCheck"
              size={17}
              className="mt-0.5 text-[#c89750]"
            />
            {item}
          </li>
        ))}
      </ul>
    </a>
  );
}
