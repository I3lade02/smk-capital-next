import { SectionKicker } from "@/components/ui/SectionKicker";
import { contractReview } from "@/lib/content";
import { Icon } from "@/lib/icons";

export function ContractReviewSection() {
  const { section } = contractReview;

  return (
    <section className="bg-white px-5 py-20 md:px-12 lg:px-16">
      <div className="grid gap-12 xl:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
        <div className="min-w-0">
          <SectionKicker>{section.kicker}</SectionKicker>

          <h2 className="max-w-3xl font-serif text-5xl leading-tight tracking-[-0.03em] text-[#061a34] md:text-6xl">
            {section.title}
          </h2>

          <p className="mt-7 max-w-2xl text-lg leading-8 text-[#061a34]/65">
            {section.description}
          </p>

          <div className="mt-9 rounded-[28px] bg-[#061a34] p-7 text-white shadow-[0_24px_65px_rgba(6,26,52,0.16)]">
            <div className="flex items-start gap-4">
              <span className="flex size-13 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-[#d7b174]">
                <Icon name="FileText" size={28} strokeWidth={1.5} />
              </span>
              <div>
                <h3 className="font-serif text-3xl leading-tight">
                  {section.highlightTitle}
                </h3>
                <p className="mt-3 leading-7 text-white/72">
                  {section.highlightText}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="min-w-0">
          <div className="mb-7 flex items-end justify-between gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#9f7035]">
                {section.areasKicker}
              </p>
              <h3 className="mt-3 font-serif text-3xl leading-tight text-[#061a34]">
                {section.areasTitle}
              </h3>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {section.areas.map((area) => (
              <article
                key={area.label}
                className="interactive-card flex min-h-24 items-center gap-4 rounded-3xl bg-[var(--section-bg)] p-5"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#c89750] shadow-[0_12px_28px_rgba(6,26,52,0.08)]">
                  <Icon name={area.icon} size={22} strokeWidth={1.6} />
                </span>
                <p className="font-semibold leading-6 text-[#061a34]">
                  {area.label}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-16 grid gap-10 xl:grid-cols-[minmax(0,1.18fr)_minmax(280px,0.72fr)]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#9f7035]">
            {section.stepsKicker}
          </p>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {section.steps.map((step) => (
              <article
                key={step.number}
                className="interactive-card rounded-3xl border border-[#061a34]/10 bg-white p-7 shadow-[0_20px_50px_rgba(6,26,52,0.08)]"
              >
                <p className="font-serif text-4xl text-[#c89750]">
                  {step.number}
                </p>
                <h3 className="mt-5 font-serif text-2xl leading-tight text-[#061a34]">
                  {step.title}
                </h3>
                <p className="mt-4 leading-7 text-[#061a34]/60">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </div>

        <aside className="rounded-[28px] bg-[var(--section-bg)] p-8">
          <div className="flex size-13 items-center justify-center rounded-2xl bg-white text-[#c89750] shadow-[0_12px_28px_rgba(6,26,52,0.08)]">
            <Icon name="Bulb" size={28} strokeWidth={1.5} />
          </div>
          <h3 className="mt-7 font-serif text-3xl leading-tight text-[#061a34]">
            {section.reasonsTitle}
          </h3>

          <ul className="mt-7 space-y-4">
            {section.reasons.map((reason) => (
              <li
                key={reason}
                className="flex items-start gap-3 leading-7 text-[#061a34]/72"
              >
                <Icon
                  name="ChevronRight"
                  size={18}
                  strokeWidth={2.2}
                  className="mt-1 shrink-0 text-[#c89750]"
                />
                <span>{reason}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 h-px w-16 bg-[#c89750]" />

          <p className="mt-6 text-sm leading-6 text-[#061a34]/58">
            {section.reasonsNote}
          </p>
        </aside>
      </div>
    </section>
  );
}
