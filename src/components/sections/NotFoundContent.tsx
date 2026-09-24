import Link from "next/link";

import { SectionKicker } from "@/components/ui/SectionKicker";
import { notFound } from "@/lib/content";
import { Icon } from "@/lib/icons";

export function NotFoundContent() {
  return (
    <section className="relative flex min-h-[76vh] items-center overflow-hidden bg-[var(--section-bg)] px-5 pb-20 pt-36 md:px-12 lg:px-16 lg:pt-40">
      <div
        className="pointer-events-none absolute -right-16 top-20 font-serif text-[15rem] leading-none text-[#061a34]/4 md:text-[24rem]"
        aria-hidden="true"
      >
        404
      </div>

      <div className="relative z-10 grid w-full items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <SectionKicker>{notFound.kicker}</SectionKicker>
          <h1 className="max-w-3xl font-serif text-5xl leading-[0.98] tracking-[-0.04em] text-[#061a34] md:text-7xl">
            {notFound.title}
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-[#061a34]/65">
            {notFound.description}
          </p>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <Link
              href={notFound.primaryCta.href}
              className="inline-flex items-center justify-center gap-3 rounded-full bg-[#061a34] px-7 py-4 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(6,26,52,0.18)] transition hover:bg-[#0b274b]"
            >
              <Icon name="Home" size={17} strokeWidth={1.8} />
              {notFound.primaryCta.label}
            </Link>
            <Link
              href={notFound.secondaryCta.href}
              className="inline-flex items-center justify-center gap-3 rounded-full border border-[#c89750] bg-white/40 px-7 py-4 text-sm font-semibold text-[#9f7035] transition hover:bg-white"
            >
              <Icon name="ArrowLeft" size={17} strokeWidth={1.8} />
              {notFound.secondaryCta.label}
            </Link>
          </div>
        </div>

        <div className="relative flex min-h-80 items-center justify-center overflow-hidden rounded-[28px] rounded-tl-[110px] bg-[#061a34] p-10 text-center shadow-[0_30px_80px_rgba(6,26,52,0.14)] md:min-h-115">
          <div className="absolute -right-20 -top-20 size-64 rounded-full bg-[#c89750]/15 blur-3xl" />
          <div className="absolute -bottom-24 -left-16 size-72 rounded-full bg-white/5 blur-3xl" />
          <div className="relative z-10">
            <p className="font-serif text-8xl leading-none text-[#c89750] md:text-9xl">
              404
            </p>
            <div className="mx-auto mt-7 h-px w-20 bg-[#c89750]" />
            <p className="mt-7 text-sm font-semibold uppercase tracking-[0.3em] text-white/70">
              {notFound.badgeLabel}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
