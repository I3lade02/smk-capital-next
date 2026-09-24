"use client";

import { SectionKicker } from "@/components/ui/SectionKicker";
import { useInteractiveAutoplayVideo } from "@/hooks/useInteractiveAutoplayVideo";
import { about } from "@/lib/content";
import { Icon } from "@/lib/icons";
import { mediaPath } from "@/lib/paths";

export function AboutVideoSection() {
  const { videoRef, videoInteractionProps } = useInteractiveAutoplayVideo();
  const { videoSection } = about;

  return (
    <section className="bg-(--section-bg) px-5 py-20 md:px-12 lg:px-16">
      <div className="mb-12 max-w-3xl">
        <SectionKicker>{videoSection.kicker}</SectionKicker>
        <h2 className="font-serif text-5xl tracking-[-0.03em]">
          {videoSection.title}
        </h2>
      </div>

      <div className="grid items-stretch gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.7fr)]">
        <div className="aspect-video w-full overflow-hidden rounded-[28px] rounded-tl-[110px] shadow-[0_30px_80px_rgba(6,26,52,0.14)]">
          <video
            ref={videoRef}
            {...videoInteractionProps}
            src={mediaPath(videoSection.video)}
            aria-label={videoSection.videoLabel}
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

        <aside className="flex flex-col justify-between rounded-[28px] bg-[#061a34] p-8 text-white shadow-[0_24px_60px_rgba(6,26,52,0.12)]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#c89750]">
              {videoSection.asideKicker}
            </p>
            <h3 className="mt-5 font-serif text-4xl leading-tight">
              {videoSection.asideTitle}
            </h3>

            <ul className="mt-8 space-y-5">
              {videoSection.asideItems.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 leading-7 text-white/75"
                >
                  <Icon
                    name="Check"
                    size={20}
                    strokeWidth={2.3}
                    className="mt-1 shrink-0 text-[#d7b174]"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-10 border-t border-white/10 pt-6 font-serif text-2xl leading-tight text-[#d7b174]">
            {videoSection.asideFooter}
          </p>
        </aside>
      </div>
    </section>
  );
}
