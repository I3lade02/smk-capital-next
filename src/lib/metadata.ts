import type { Metadata } from "next";

import { site } from "@/lib/content";

const DEFAULT_ROBOTS = {
  index: true,
  follow: true,
  "max-image-preview": "large",
  "max-snippet": -1,
  "max-video-preview": -1,
} as const;

type PageMetadataInput = {
  title: string;
  description: string;
  /** Cesta od kořene webu, např. "/sluzby". Pro úvodní stránku "/". */
  path: string;
  noindex?: boolean;
};

/**
 * Na rozdíl od původního webu (kde se titulky doplňovaly až v prohlížeči
 * pomocí komponenty <Seo />) je teď každá stránka předgenerovaná, takže
 * správný titulek, popis i Open Graph vidí i roboti, kteří nespouští
 * JavaScript – například náhledy odkazů na sociálních sítích.
 */
export function createPageMetadata({
  title,
  description,
  path,
  noindex = false,
}: PageMetadataInput): Metadata {
  const url = path === "/" ? "/" : path.endsWith("/") ? path : `${path}/`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    robots: noindex ? { index: false, follow: false } : DEFAULT_ROBOTS,
    openGraph: {
      type: "website",
      locale: "cs_CZ",
      siteName: site.shortName,
      title,
      description,
      url,
      images: [{ url: site.ogImage, width: 300, height: 240 }],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: [site.ogImage],
    },
  };
}
