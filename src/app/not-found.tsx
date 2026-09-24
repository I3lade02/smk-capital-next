import type { Metadata } from "next";

import { NotFoundContent } from "@/components/sections/NotFoundContent";
import { notFound } from "@/lib/content";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: notFound.seo.title,
  description: notFound.seo.description,
  path: "/nenalezeno",
  noindex: true,
});

/**
 * Při statickém exportu z téhle stránky vznikne soubor `out/404.html`.
 * Apache na Endoře ho používá díky direktivě ErrorDocument v .htaccess,
 * takže neexistující adresa zobrazí web ve správném vzhledu.
 */
export default function NotFound() {
  return <NotFoundContent />;
}
