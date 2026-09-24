import { SectionKicker } from "@/components/ui/SectionKicker";
import { home, processContent } from "@/lib/content";

export function ProcessSection() {
  return (
    <section
      id="process"
      className="bg-(--section-bg) px-5 py-20 md:px-12 lg:px-16"
    >
      <div className="mb-12 max-w-3xl">
        <SectionKicker>{home.process.kicker}</SectionKicker>
        <h2 className="font-serif text-5xl leading-tight tracking-[-0.03em]">
          {home.process.title}
        </h2>
        <p className="mt-6 text-lg leading-8 text-[#061a34]/65">
          {home.process.description}
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        {processContent.steps.map((step) => (
          <article
            key={step.number}
            className="interactive-card rounded-3xl bg-white p-7 shadow-[0_22px_55px_rgba(6,26,52,0.08)]"
          >
            <p className="font-serif text-4xl text-[#c89750]">{step.number}</p>
            <h3 className="mt-6 font-serif text-2xl leading-tight">
              {step.title}
            </h3>
            <p className="mt-4 text-sm leading-7 text-[#061a34]/60">
              {step.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
