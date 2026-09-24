import type { Metadata, Viewport } from "next";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { PageNavigation } from "@/components/layout/PageNavigation";
import { RouteEffects } from "@/components/layout/RouteEffects";
import { Sidebar } from "@/components/layout/Sidebar";
import { home, site } from "@/lib/content";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: home.seo.title,
    template: "%s",
  },
  description: home.seo.description,
  authors: [{ name: site.shortName }],
  icons: {
    icon: "/favicon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#061a34",
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${site.url}/#organization`,
  name: site.shortName,
  url: `${site.url}/`,
  description:
    "Kompletní finanční servis v oblasti pojištění, hypoték, úvěrů, investic a správy smluv.",
  email: site.email,
  areaServed: {
    "@type": "Country",
    name: "Česká republika",
  },
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: "+420607845260",
      contactType: "customer service",
      areaServed: "CZ",
      availableLanguage: "cs",
    },
    {
      "@type": "ContactPoint",
      telephone: "+420773598104",
      contactType: "customer service",
      areaServed: "CZ",
      availableLanguage: "cs",
    },
  ],
  sameAs: site.social
    .filter((item) => item.href.startsWith("http"))
    .map((item) => item.href),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="cs">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />

        <RouteEffects />

        <main
          id="main-content"
          tabIndex={-1}
          className="min-h-screen bg-(--page-bg) text-[#061a34] focus:outline-none"
        >
          <div className="mx-auto grid min-h-screen lg:grid-cols-[160px_1fr]">
            <Sidebar />

            <div className="relative overflow-hidden">
              <Header />
              {children}
              <PageNavigation />
              <Footer />
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
