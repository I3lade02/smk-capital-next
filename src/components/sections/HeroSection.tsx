"use client";

import { IconChevronRight } from "@tabler/icons-react";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { useInteractiveAutoplayVideo } from "@/hooks/useInteractiveAutoplayVideo";
import { home } from "@/lib/content";
import { mediaPath } from "@/lib/paths";

export function HeroSection() {
  const { videoRef, videoInteractionProps } = useInteractiveAutoplayVideo();
  const { hero } = home;

  return (
    <section
      id="home"
      className="relative overflow-hidden bg-(--section-bg) px-5 pb-20 pt-32 md:px-12 lg:px-16 lg:pb-28 lg:pt-28"
    >
      <div className="grid items-center gap-12 lg:grid-cols-[0.88fr_1.12fr]">
        <div className="relative z-10 min-w-0 max-w-2xl">
          <p className="inline-flex rounded-full border border-[#c89750]/25 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-[#9f7035] shadow-[0_16px_40px_rgba(6,26,52,0.08)]">
            {hero.badge}
          </p>

          <h1 className="home-hero-title-glow mt-6 font-serif text-6xl leading-[0.92] tracking-tighter text-[#061a34] md:text-8xl xl:text-[108px]">
            {hero.titleFirstLine}
            <br />
            <span className="text-[#c89750]">{hero.titleSecondLine}</span>
          </h1>

          <p className="mt-7 max-w-xl text-xl font-semibold leading-8 text-[#061a34]">
            {hero.lead}
          </p>

          <p className="mt-4 max-w-xl text-lg leading-8 text-[#061a34]/70">
            {hero.description}
          </p>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <Button
              href={hero.primaryCta.href}
              className="home-hero-cta-bounce px-10 py-5 text-lg font-bold md:px-12 md:py-6 md:text-xl"
            >
              {hero.primaryCta.label}
            </Button>
          </div>

          <Link
            href={hero.secondaryCta.href}
            className="mt-4 inline-flex items-center justify-center gap-3 rounded-full bg-[#061a34] px-8 py-4 text-base font-semibold text-white shadow-[0_18px_45px_rgba(6,26,52,0.18)] transition hover:bg-[#0b274b]"
          >
            {hero.secondaryCta.label}
            <IconChevronRight size={17} strokeWidth={2} aria-hidden="true" />
          </Link>

          <div className="mt-8 flex flex-wrap gap-3">
            {hero.highlights.map((item) => (
              <span
                key={item}
                className="rounded-full border border-[#061a34]/10 bg-white px-4 py-2 text-sm text-[#061a34]/65 shadow-[0_14px_35px_rgba(6,26,52,0.06)]"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="min-w-0">
          <div className="aspect-video overflow-hidden rounded-[28px] shadow-[0_30px_80px_rgba(6,26,52,0.12)]">
            <video
              ref={videoRef}
              {...videoInteractionProps}
              src={mediaPath(hero.video)}
              aria-label={hero.videoLabel}
              className="size-full object-cover"
              autoPlay
              controls
              loop
              muted
              playsInline
              preload="metadata"
            >
              Váš prohlížeč nepodporuje přehrávání videa.
            </video>
          </div>
        </div>
      </div>
    </section>
  );
}
