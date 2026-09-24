import { SectionKicker } from "@/components/ui/SectionKicker";
import { partners, type Partner } from "@/lib/content";
import { assetPath } from "@/lib/paths";

function PartnerLogo({ partner }: { partner: Partner }) {
  return (
    <div className="partner-logo-card">
      <img
        src={assetPath(partner.logo)}
        alt=""
        className="partner-logo"
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}

export function PartnersSection() {
  const partnerRows = [partners.rowOne, partners.rowTwo];
  const allPartners = partnerRows.flat();

  return (
    <section
      id="partners"
      aria-labelledby="partners-title"
      className="overflow-hidden bg-white py-20"
    >
      <div className="px-5 md:px-12 lg:px-16">
        <div className="mx-auto max-w-3xl text-center">
          <SectionKicker>{partners.kicker}</SectionKicker>
          <h2
            id="partners-title"
            className="font-serif text-5xl leading-tight tracking-[-0.03em]"
          >
            {partners.title}
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[#061a34]/65">
            {partners.description}
          </p>
        </div>
      </div>

      <div className="partners-marquee mt-12 space-y-5" aria-hidden="true">
        {partnerRows.map((row, rowIndex) => (
          <div key={rowIndex} className="partners-marquee-row">
            {[0, 1, 2].map((copyIndex) => (
              <div
                key={copyIndex}
                className={`partners-marquee-track ${
                  rowIndex === 1 ? "partners-marquee-track--reverse" : ""
                } ${copyIndex > 0 ? "partners-marquee-track--duplicate" : ""}`}
              >
                {row.map((partner) => (
                  <PartnerLogo
                    key={`${copyIndex}-${partner.name}`}
                    partner={partner}
                  />
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>

      <ul className="sr-only">
        {allPartners.map((partner) => (
          <li key={partner.name}>{partner.name}</li>
        ))}
      </ul>
    </section>
  );
}
