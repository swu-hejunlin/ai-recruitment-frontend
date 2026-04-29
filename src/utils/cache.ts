interface CacheEntry {
  data: unknown
  timestamp: number
  ttl: number
}

const cache = new Map<string, CacheEntry>()
const DEFAULT_TTL = 60000

const CACHE_KEY_PREFIXES: { prefix: string; ttl: number }[] = [
  { prefix: '/api/position/latest', ttl: 120000 },
  { prefix: '/api/position/hot', ttl: 120000 },
  { prefix: '/api/job-seeker/info', ttl: 30000 },
  { prefix: '/api/company/info', ttl: 30000 },
  { prefix: '/api/notification/unread-count', ttl: 15000 },
  { prefix: '/api/statistics', ttl: 120000 },
  { prefix: '/api/job-recommend', ttl: 60000 },
  { prefix: '/api/talent-recommend', ttl: 60000 },
]

function getCacheTTL(url: string): number {
  for (const { prefix, ttl } of CACHE_KEY_PREFIXES) {
    if (url.includes(prefix)) return ttl
  }
  return DEFAULT_TTL
}

export function getCacheKey(url: string, params?: Record<string, unknown>): string {
  if (!params || Object.keys(params).length === 0) return url
  const sorted = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== '')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&')
  return sorted ? `${url}?${sorted}` : url
}

export function getFromCache<T>(key: string): T | null {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() - entry.timestamp > entry.ttl) {
    cache.delete(key)
    return null
  }
  return entry.data as T
}

export function setCache(key: string, data: unknown, ttl?: number): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl: ttl ?? getCacheTTL(key)
  })
}

export function invalidateCache(prefix: string): void {
  for (const key of cache.keys()) {
    if (key.includes(prefix)) {
      cache.delete(key)
    }
  }
}

export function invalidateAllCache(): void {
  cache.clear()
}
