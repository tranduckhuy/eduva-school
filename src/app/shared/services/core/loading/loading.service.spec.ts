import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';

import { LoadingService } from './loading.service';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadingService);
    service.reset();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should not be loading by default', () => {
    expect(service.isLoading()).toBe(false);
    expect(service.is()()).toBe(false);
  });

  it('should set loading to true for a key', () => {
    service.start('foo');
    expect(service.is('foo')()).toBe(true);
    expect(service.isLoading()).toBe(true);
  });

  it('should set loading to false for a key', () => {
    service.start('foo');
    service.stop('foo');
    expect(service.is('foo')()).toBe(false);
    expect(service.isLoading()).toBe(false);
  });

  it('should handle multiple keys', () => {
    service.start('foo');
    service.start('bar');
    expect(service.is('foo')()).toBe(true);
    expect(service.is('bar')()).toBe(true);
    expect(service.isLoading()).toBe(true);
    service.stop('foo');
    expect(service.is('foo')()).toBe(false);
    expect(service.is('bar')()).toBe(true);
    expect(service.isLoading()).toBe(true);
    service.stop('bar');
    expect(service.isLoading()).toBe(false);
  });

  it('should reset all keys', () => {
    service.start('foo');
    service.start('bar');
    service.reset();
    expect(service.is('foo')()).toBe(false);
    expect(service.is('bar')()).toBe(false);
    expect(service.isLoading()).toBe(false);
  });

  it('should use default key if none provided', () => {
    service.start();
    expect(service.is()()).toBe(true);
    service.stop();
    expect(service.is()()).toBe(false);
  });

  it('should return false for unknown key', () => {
    expect(service.is('unknown')()).toBe(false);
  });
});
