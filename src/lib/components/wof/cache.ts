export interface CacheEntry<T> {
	value: T;
	expiration: number;
}

/*
 * Simple TTL Cache for storing frequently accessed objects
 */
export class TTLCache<K, V> {
	private cache = new Map<K, CacheEntry<V>>();
	private cleanupInterval: ReturnType<typeof setInterval>;
  
	constructor(private defaultTTL: number = 60000, cleanupPeriod: number = 60000) {
	  this.cleanupInterval = setInterval(() => this.cleanup(), cleanupPeriod);
	}
  
	set(key: K, value: V, ttl?: number): void {
	  const expiration = Date.now() + (ttl ?? this.defaultTTL);
	  this.cache.set(key, { value, expiration });
	}
  
	get(key: K): V | undefined {
	  const entry = this.cache.get(key);
	  if (!entry) return undefined;
  
	  if (Date.now() > entry.expiration) {
		this.cache.delete(key);
		return undefined;
	  }
  
	  return entry.value;
	}
  
	has(key: K): boolean {
	  const entry = this.cache.get(key);
	  if (!entry) return false;
	  if (Date.now() > entry.expiration) {
		this.cache.delete(key);
		return false;
	  }
	  return true;
	}
  
	delete(key: K): void {
	  this.cache.delete(key);
	}
  
	clear(): void {
	  this.cache.clear();
	}
  
	private cleanup(): void {
	  const now = Date.now();
	  for (const [key, entry] of this.cache) {
		if (now > entry.expiration) {
		  this.cache.delete(key);
		}
	  }
	}
  
	destroy(): void {
	  clearInterval(this.cleanupInterval);
	  this.cache.clear();
	}
  }