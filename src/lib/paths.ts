/**
 * Web se exportuje s `trailingSlash: true`, takže URL v prohlížeči vypadá
 * jako `/sluzby/`, zatímco v obsahu je odkaz zapsaný jako `/sluzby`.
 * Tahle funkce obě varianty srovná, aby se správně poznala aktivní stránka.
 */
export function normalizePath(path: string | null | undefined) {
  if (!path) {
    return "/";
  }

  const withoutTrailingSlash = path.replace(/\/+$/, "");

  return withoutTrailingSlash === "" ? "/" : withoutTrailingSlash;
}

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const mediaOrigin = process.env.NEXT_PUBLIC_MEDIA_ORIGIN ?? "";

/**
 * Cesty k souborům z `public/` (loga, obrázky, favicon). Na Endoře web běží
 * v kořeni domény, ale na GitHub Pages pod `/smk-capital-next/` – <Link>
 * si prefix doplní sám, obyčejné <img> a <video> ne. Absolutní adresy
 * (https://…) se nemění.
 */
export function assetPath(path: string) {
  return path.startsWith("/") && !path.startsWith("//")
    ? `${basePath}${path}`
    : path;
}

/**
 * Video není v repozitáři (má přes 100 MB), leží jen na hostingu. Pro náhled
 * na GitHub Pages se proto načítá přímo ze smkcapital.cz.
 */
export function mediaPath(path: string) {
  return mediaOrigin && path.startsWith("/") && !path.startsWith("//")
    ? `${mediaOrigin}${path}`
    : assetPath(path);
}
