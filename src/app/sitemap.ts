import type { MetadataRoute } from "next";

import { site } from "@/lib/content";

export const dynamic = "force-static";

/**
 * Sitemapa se generuje z navigace v obsahu, takže když klient v administraci
 * přidá nebo přejmenuje stránku, sitemap.xml se aktualizuje sám.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return site.navigation.pages.map((page) => ({
    url: `${site.url}${page.href === "/" ? "/" : `${page.href}/`}`,
    lastModified,
    changeFrequency: "monthly",
    priority: page.href === "/" ? 1 : 0.8,
  }));
}
