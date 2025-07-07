import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { CacheService } from './cache.service';

describe('CacheService', () => {
  let service: CacheService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CacheService);
    service.clear(); // ensure clean state
    vi.useFakeTimers();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return null if not cached', () => {
    expect(service.get('not-exist')).toBeNull();
  });

  it('should cache and retrieve value', () => {
    service.set('url', { foo: 'bar' }, 1000);
    expect(service.get('url')).toEqual({ foo: 'bar' });
  });

  it('should expire cache after ttl', () => {
    service.set('url', { foo: 'bar' }, 1); // 1ms TTL
    // Simulate time passing
    vi.advanceTimersByTime(2);
    expect(service.get('url')).toBeNull();
  });

  it('should clear specific url', () => {
    service.set('url1', 1);
    service.set('url2', 2);
    service.clear('url1');
    expect(service.get('url1')).toBeNull();
    expect(service.get('url2')).toBe(2);
  });

  it('should clear all cache', () => {
    service.set('url1', 1);
    service.set('url2', 2);
    service.clear();
    expect(service.get('url1')).toBeNull();
    expect(service.get('url2')).toBeNull();
  });

  it('should overwrite cache for same url', () => {
    service.set('url', 1);
    service.set('url', 2);
    expect(service.get('url')).toBe(2);
  });
});
