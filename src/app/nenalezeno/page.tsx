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

export default function NotFoundPage() {
  return <NotFoundContent />;
}
