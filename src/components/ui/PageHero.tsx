import type { ReactNode } from "react";

import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { SectionKicker } from "@/components/ui/SectionKicker";

type PageHeroProps = {
  kicker: string;
  title: string;
  description: string;
  media?: ReactNode;
  children?: ReactNode;
};

export function PageHeroLogoMedia() {
  return (
    <div className="relative flex min-h-115 items-center justify-center overflow-hidden rounded-[28px] rounded-tl-[110px] bg-[#061a34] p-5 shadow-[0_30px_80px_rgba(6,26,52,0.14)] md:p-10">
      <div className="absolute -right-20 -top-20 size-64 rounded-full bg-[#c89750]/10 blur-3xl" />
      <div className="absolute -bottom-24 -left-16 size-72 rounded-full bg-white/5 blur-3xl" />
      <div className="relative z-10">
        <Logo variant="light" />
      </div>
    </div>
  );
}

export function PageHero({
  kicker,
  title,
  description,
  media,
  children,
}: PageHeroProps) {
  return (
    <section className="relative bg-[var(--section-bg)] px-5 pb-16 pt-36 md:px-12 lg:px-16 lg:pt-40">
      <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="min-w-0">
          <SectionKicker>{kicker}</SectionKicker>

          <h1 className="max-w-3xl font-serif text-5xl leading-[0.98] tracking-[-0.04em] text-[#061a34] md:text-7xl">
            {title}
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-8 text-[#061a34]/65">
            {description}
          </p>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <Button href="#contact">Požadavek na zavolání</Button>
            <Button href="/sluzby" variant="secondary">
              Zobrazit služby
            </Button>
          </div>

          {children ? <div className="mt-10">{children}</div> : null}
        </div>

        {media ? (
          <div className="min-w-0">{media}</div>
        ) : (
          <div className="min-h-80 min-w-0 rounded-[28px] rounded-tl-[110px] bg-[#061a34]" />
        )}
      </div>
    </section>
  );
}
