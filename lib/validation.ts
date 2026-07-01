// Server-side input caps and media-URL allowlisting for memorial data.
// Keeps attacker-controlled payloads from bloating the DB or making a
// memorial page embed arbitrary third-party URLs.

export const LIMITS = {
  deceasedName: 120,
  bio: 5000,
  quote: 500,
  date: 40,
  mediaCount: 60,
  videoCount: 30,
  familyTreeBytes: 40_000,
} as const

// Vercel Blob public store. All user media is uploaded there, so finished
// URLs must live on this host — anything else is rejected.
const ALLOWED_MEDIA_HOST_SUFFIX = '.public.blob.vercel-storage.com'

export function isAllowedMediaUrl(url: string): boolean {
  try {
    const u = new URL(url)
    return u.protocol === 'https:' && u.hostname.endsWith(ALLOWED_MEDIA_HOST_SUFFIX)
  } catch {
    return false
  }
}

/** Returns an error message if any text field exceeds its cap, else null. */
export function memorialTextError(m: {
  deceasedName?: unknown
  bio?: unknown
  quote?: unknown
  birthDate?: unknown
  deathDate?: unknown
}): string | null {
  const check = (val: unknown, max: number, label: string): string | null => {
    if (val == null) return null
    if (typeof val !== 'string') return `${label} invalid`
    if (val.length > max) return `${label} depășește ${max} de caractere`
    return null
  }
  return (
    check(m.deceasedName, LIMITS.deceasedName, 'Numele') ||
    check(m.bio, LIMITS.bio, 'Biografia') ||
    check(m.quote, LIMITS.quote, 'Citatul') ||
    check(m.birthDate, LIMITS.date, 'Data nașterii') ||
    check(m.deathDate, LIMITS.date, 'Data decesului')
  )
}

/** Validates media/video URL arrays: type, count cap, and host allowlist. */
export function mediaUrlsError(urls: unknown, max: number, label: string): string | null {
  if (urls == null) return null
  if (!Array.isArray(urls)) return `${label} invalid`
  if (urls.length > max) return `${label}: prea multe fișiere`
  for (const u of urls) {
    if (typeof u !== 'string' || !isAllowedMediaUrl(u)) return `${label}: URL nepermis`
  }
  return null
}

/** Rejects a single optional media URL (profile/banner) that isn't allowed. */
export function singleMediaUrlError(url: unknown, label: string): string | null {
  if (url == null || url === '') return null
  if (typeof url !== 'string' || !isAllowedMediaUrl(url)) return `${label}: URL nepermis`
  return null
}

/** Caps the serialized size of the family-tree JSON blob. */
export function familyTreeError(tree: unknown): string | null {
  if (tree == null) return null
  try {
    if (JSON.stringify(tree).length > LIMITS.familyTreeBytes) return 'Arborele genealogic este prea mare'
  } catch {
    return 'Arbore genealogic invalid'
  }
  return null
}
