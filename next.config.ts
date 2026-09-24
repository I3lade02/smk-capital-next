import type { NextConfig } from "next";

/**
 * Web se nasazuje jako statický export na hosting Endora (Apache, PHP, bez Node.js).
 *
 * - `output: "export"` vygeneruje do složky `out/` čisté HTML/CSS/JS,
 *   které se dá nahrát na FTP úplně stejně jako dosavadní build.
 * - `trailingSlash: true` vytvoří `out/sluzby/index.html`, takže Apache
 *   obslouží `/sluzby` i `/sluzby/` bez jakéhokoli přepisování URL.
 * - `images.unoptimized` je nutné, protože optimalizace obrázků v Next.js
 *   vyžaduje Node.js server, který na sdíleném hostingu není.
 * - `basePath` je prázdný pro Endoru; workflow pro GitHub Pages nastaví
 *   `NEXT_PUBLIC_BASE_PATH=/smk-capital-next`, protože tam web neběží
 *   v kořeni domény.
 */
const nextConfig: NextConfig = {
  output: "export",
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || undefined,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
