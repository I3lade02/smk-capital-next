import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Web se exportuje staticky, takže optimalizace obrázků přes next/image
      // stejně neběží. Používáme obyčejné <img>, aby zůstalo zachované přesné
      // chování původního webu (poměry stran, object-fit, marquee s logy).
      "@next/next/no-img-element": "off",
    },
  },
  {
    ignores: ["out/**", ".next/**", "node_modules/**", "public/admin/**"],
  },
];

export default eslintConfig;
