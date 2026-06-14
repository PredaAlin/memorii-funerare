// Best-effort in-memory IP rate limiter. Resets on serverless cold start —
// good enough as a soft guard against abuse, not a hard security boundary.
const hits = new Map<string, number[]>()

/**
 * Returns true if the action is allowed, false if the caller has exceeded
 * `max` actions within the trailing `windowMs` window for the given key.
 */
export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now()
  const recent = (hits.get(key) ?? []).filter(t => now - t < windowMs)
  if (recent.length >= max) {
    hits.set(key, recent)
    return false
  }
  recent.push(now)
  hits.set(key, recent)
  return true
}

/** Extract a best-effort client IP from request headers. */
export function clientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return req.headers.get('x-real-ip') ?? 'unknown'
}
