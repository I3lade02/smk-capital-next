"use client";

import { useEffect, useState } from "react";
import { IconStar, IconStarFilled } from "@tabler/icons-react";

import { Button } from "@/components/ui/Button";
import { SectionKicker } from "@/components/ui/SectionKicker";
import { home } from "@/lib/content";

const reviewIntervalMs = 15000;
const reviewFadeMs = 2400;

export function ReviewsSection() {
  const { reviews } = home;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let fadeTimeoutId: number | undefined;

    const intervalId = window.setInterval(() => {
      setIsVisible(false);
      fadeTimeoutId = window.setTimeout(() => {
        setActiveIndex((index) => (index + 1) % reviews.items.length);
        setIsVisible(true);
      }, reviewFadeMs);
    }, reviewIntervalMs);

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(fadeTimeoutId);
    };
  }, [reviews.items.length]);

  const review = reviews.items[activeIndex];

  return (
    <section
      id="reviews"
      className="bg-[#061a34] px-5 py-20 text-white md:px-12 lg:px-16"
    >
      <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <SectionKicker>{reviews.kicker}</SectionKicker>
          <h2 className="font-serif text-5xl leading-tight tracking-[-0.03em] text-white">
            {reviews.title}
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-8 text-white/70">
            {reviews.description}
          </p>

          <Button
            href="#contact"
            variant="secondary"
            className="mt-9 border-white/20 text-white hover:bg-white/10"
          >
            {reviews.ctaLabel}
          </Button>
        </div>

        <div className="flex items-center">
          <div
            className="flex min-h-[300px] w-full flex-col justify-center rounded-3xl border border-white/10 bg-white/5 p-8 md:p-10"
            style={{
              transition: `opacity ${reviewFadeMs}ms cubic-bezier(0.445, 0.05, 0.55, 0.95)`,
              opacity: isVisible ? 1 : 0,
            }}
          >
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, index) =>
                index < review.rating ? (
                  <IconStarFilled
                    key={index}
                    size={20}
                    className="text-[#c89750]"
                  />
                ) : (
                  <IconStar key={index} size={20} className="text-white/25" />
                ),
              )}
            </div>
            <p className="mt-6 font-serif text-2xl leading-snug text-white">
              „{review.text}“
            </p>
            <div className="mt-8">
              <p className="text-sm font-bold text-white">{review.name}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.3em] text-white/50">
                {review.service}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
