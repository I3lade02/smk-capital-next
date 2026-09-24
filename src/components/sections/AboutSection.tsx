import { SectionKicker } from "@/components/ui/SectionKicker";
import { home } from "@/lib/content";

export function AboutSection() {
  const { about } = home;

  return (
    <section id="about" className="bg-white px-5 py-20 md:px-12 lg:px-16">
      <div className="grid gap-12 lg:grid-cols-[0.78fr_1.22fr]">
        <div>
          <SectionKicker>{about.kicker}</SectionKicker>
          <h2 className="font-serif text-5xl leading-tight tracking-[-0.03em]">
            {about.title}
          </h2>

          <p className="mt-6 max-w-xl text-lg leading-8 text-[#061a34]/65">
            {about.lead}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {about.highlights.map((item) => (
              <span
                key={item}
                className="rounded-full border border-[#061a34]/10 bg-(--section-bg) px-4 py-2 text-sm text-[#061a34]/70"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="interactive-card rounded-4xl bg-[#061a34] p-8 text-white shadow-[0_30px_80px_rgba(6,26,52,0.16)] md:p-10">
          <div className="space-y-5 text-base leading-8 text-white/78">
            {about.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
