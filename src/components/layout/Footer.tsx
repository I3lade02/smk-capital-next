import Link from "next/link";

import { Logo } from "@/components/ui/Logo";
import { services, site } from "@/lib/content";
import { Icon } from "@/lib/icons";

const socialLinkClassName =
  "flex size-10 items-center justify-center rounded-full bg-[#061a34] text-white transition hover:bg-[#c89750]";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white px-5 py-10 md:px-12 lg:px-16">
      <div className="grid gap-10 border-t border-[#061a34]/10 pt-10 md:grid-cols-[220px_1fr_1fr_1fr]">
        <div>
          <Logo compact />
        </div>

        <div>
          <h3 className="mb-4 text-sm font-bold">
            {site.footer.servicesHeading}
          </h3>
          <ul className="space-y-2 text-sm text-[#061a34]/65">
            {services.categories.map((service) => (
              <li key={service.title}>
                <Link href={service.href}>{service.title}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-bold">
            {site.footer.contactHeading}
          </h3>
          <div className="space-y-2 text-sm text-[#061a34]/65">
            <p>{site.phone}</p>
            <p>{site.email}</p>
            {site.address.map((line) => (
              <p key={line}>{line}</p>
            ))}
            <p>IČO: {site.ico}</p>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-bold">{site.footer.socialHeading}</h3>

          <div className="flex gap-3">
            {site.social.map((social) => {
              const isExternal = social.href.startsWith("http");
              const icon = (
                <Icon name={social.icon} size={19} strokeWidth={1.8} />
              );

              if (isExternal) {
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className={socialLinkClassName}
                  >
                    {icon}
                  </a>
                );
              }

              return (
                <Link
                  key={social.label}
                  href={social.href}
                  aria-label={`${social.label} – stránka zatím není dostupná`}
                  className={socialLinkClassName}
                >
                  {icon}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-10 flex flex-col gap-3 border-t border-[#061a34]/10 pt-6 text-xs text-[#061a34]/50 md:flex-row md:items-center md:justify-between">
        <p>
          © {currentYear} {site.name}. {site.footer.copyright}
        </p>

        <div className="flex gap-6">
          {site.footer.legalLinks.map((link) => (
            <a key={link.label} href={link.href}>
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
