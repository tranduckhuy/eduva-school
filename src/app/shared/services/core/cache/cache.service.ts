import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CacheService {
  private readonly cache = new Map<string, { body: any; expiry: number }>();

  get(url: string): any {
    const cached = this.cache.get(url);
    if (!cached) return null;
    if (Date.now() > cached.expiry) {
      this.cache.delete(url);
      return null;
    }
    return cached.body;
  }

  set(url: string, body: any, ttlMs: number = 5 * 60 * 1000) {
    this.cache.set(url, { body, expiry: Date.now() + ttlMs });
  }

  clear(url?: string) {
    url ? this.cache.delete(url) : this.cache.clear();
  }
}
