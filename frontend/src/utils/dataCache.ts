export interface CacheEntry<T = any> {
  data: T
  timestamp: number
  expiresAt: number
  size: number
  accessCount: number
}

export interface CacheStats {
  totalEntries: number
  totalSize: number
  hitRate: number
  missCount: number
  hitCount: number
}

export class DataCache<T = any> {
  private cache = new Map<string, CacheEntry<T>>()
  private maxSize: number
  private maxAge: number
  private stats: CacheStats = {
    totalEntries: 0,
    totalSize: 0,
    hitRate: 0,
    missCount: 0,
    hitCount: 0
  }

  constructor(maxSize = 100, maxAge = 5 * 60 * 1000) { // 5 minutes default
    this.maxSize = maxSize
    this.maxAge = maxAge
  }

  set(key: string, data: T, ttl?: number): void {
    const now = Date.now()
    const expiresAt = now + (ttl || this.maxAge)
    const size = this.estimateSize(data)
    
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiresAt,
      size,
      accessCount: 0
    }

    // Remove expired entries before adding new one
    this.cleanup()

    // If cache is full, remove LRU entry
    if (this.cache.size >= this.maxSize) {
      this.evictLRU()
    }

    this.cache.set(key, entry)
    this.updateStats()
  }

  get(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      this.stats.missCount++
      this.updateHitRate()
      return null
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      this.stats.missCount++
      this.updateHitRate()
      return null
    }

    // Update access info
    entry.accessCount++
    entry.timestamp = Date.now()
    
    this.stats.hitCount++
    this.updateHitRate()
    
    return entry.data
  }

  has(key: string): boolean {
    return this.get(key) !== null
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key)
    if (deleted) {
      this.updateStats()
    }
    return deleted
  }

  clear(): void {
    this.cache.clear()
    this.stats = {
      totalEntries: 0,
      totalSize: 0,
      hitRate: 0,
      missCount: 0,
      hitCount: 0
    }
  }

  getStats(): CacheStats {
    return { ...this.stats }
  }

  private cleanup(): void {
    const now = Date.now()
    const expiredKeys: string[] = []

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        expiredKeys.push(key)
      }
    }

    expiredKeys.forEach(key => this.cache.delete(key))
  }

  private evictLRU(): void {
    let oldestKey: string | null = null
    let oldestTime = Infinity
    let lowestAccessCount = Infinity

    for (const [key, entry] of this.cache.entries()) {
      if (entry.accessCount < lowestAccessCount || 
          (entry.accessCount === lowestAccessCount && entry.timestamp < oldestTime)) {
        oldestKey = key
        oldestTime = entry.timestamp
        lowestAccessCount = entry.accessCount
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
    }
  }

  private estimateSize(data: T): number {
    try {
      return JSON.stringify(data).length * 2 // Rough estimate (2 bytes per char)
    } catch {
      return 1000 // Default size if can't serialize
    }
  }

  private updateStats(): void {
    this.stats.totalEntries = this.cache.size
    this.stats.totalSize = Array.from(this.cache.values())
      .reduce((sum, entry) => sum + entry.size, 0)
  }

  private updateHitRate(): void {
    const total = this.stats.hitCount + this.stats.missCount
    this.stats.hitRate = total > 0 ? this.stats.hitCount / total : 0
  }
}

export const createDataCache = <T = any>(maxSize = 100, maxAge = 5 * 60 * 1000): DataCache<T> => {
  return new DataCache<T>(maxSize, maxAge)
}

// Global chart data cache instance
export const globalChartCache = createDataCache(200, 10 * 60 * 1000) // 10 minutes

export default createDataCache