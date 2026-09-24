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
