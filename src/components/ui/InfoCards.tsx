import { Icon } from "@/lib/icons";
import type { InfoCard, ProcessItem } from "@/lib/content";

/**
 * Dvojice karet pod nadpisem na stránkách s formuláři
 * (Autopojištění, Hypoteční propočet, Revize smluv).
 */
export function HeroInfoCards({ cards }: { cards: InfoCard[] }) {
  return (
    <div className="mt-9 grid gap-4 sm:grid-cols-2">
      {cards.map((card) => (
        <div
          key={card.title}
          className={
            card.highlighted
              ? "rounded-[24px] border border-[#c89750]/30 bg-[#fbf8f3] p-5 shadow-[0_18px_45px_rgba(6,26,52,0.08)]"
              : "rounded-[24px] border border-[#061a34]/10 bg-white p-5 shadow-[0_18px_45px_rgba(6,26,52,0.08)]"
          }
        >
          <Icon name={card.icon} size={32} strokeWidth={1.5} className="text-[#c89750]" />
          <p className="mt-4 font-serif text-2xl leading-tight text-[#061a34]">
            {card.title}
          </p>
          <p className="mt-3 text-sm leading-6 text-[#061a34]/60">{card.text}</p>
        </div>
      ))}
    </div>
  );
}

/** Trojice karet „Jak to probíhá“ ve spodní části stránek s formuláři. */
export function ProcessCards({
  items,
  className = "grid gap-5 lg:grid-cols-3",
}: {
  items: ProcessItem[];
  className?: string;
}) {
  return (
    <div className={className}>
      {items.map((item) => (
        <article
          key={item.title}
          className="interactive-card rounded-3xl bg-white p-8 shadow-[0_22px_55px_rgba(6,26,52,0.09)]"
        >
          <Icon
            name={item.icon}
            size={42}
            strokeWidth={1.4}
            className="interactive-card-icon text-[#c89750]"
          />
          <h3 className="mt-7 font-serif text-3xl leading-tight text-[#061a34]">
            {item.title}
          </h3>
          <p className="mt-4 leading-7 text-[#061a34]/60">{item.text}</p>
        </article>
      ))}
    </div>
  );
}
