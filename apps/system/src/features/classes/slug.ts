export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Devuelve `base`, o `base-2`, `base-3`… si ya existe. */
export function pickUniqueSlug(base: string, taken: string[]): string {
  const fallback = base || 'clase'
  if (!taken.includes(fallback)) return fallback
  let suffix = 2
  while (taken.includes(`${fallback}-${suffix}`)) suffix += 1
  return `${fallback}-${suffix}`
}
