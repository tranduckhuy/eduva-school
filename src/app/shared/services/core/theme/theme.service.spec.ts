import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('ThemeService', () => {
  let service: ThemeService;
  let mockMatchMedia: any;

  beforeEach(() => {
    // Clear DOM class and localStorage before each test
    document.documentElement.classList.remove('dark');
    localStorage.clear();

    // Mock matchMedia for consistent testing
    mockMatchMedia = vi.fn().mockImplementation(query => ({
      matches: false, // Default to light mode
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia,
    });

    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should default to light theme when no localStorage value exists', () => {
    expect(service.theme()).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('should initialize with dark theme if localStorage has "dark"', async () => {
    localStorage.setItem('theme', 'dark');

    // Create a new service instance to test initialization
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const newService = TestBed.inject(ThemeService);

    await Promise.resolve();
    expect(newService.theme()).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('should initialize with light theme if localStorage has "light"', async () => {
    localStorage.setItem('theme', 'light');

    // Create a new service instance to test initialization
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const newService = TestBed.inject(ThemeService);

    await Promise.resolve();
    expect(newService.theme()).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('should use system preference when localStorage has invalid value', async () => {
    localStorage.setItem('theme', 'invalid');

    // Mock system prefers dark BEFORE creating service
    mockMatchMedia.mockImplementation((query: string) => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    // Create a new service instance to test initialization
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const newService = TestBed.inject(ThemeService);

    await Promise.resolve();
    expect(newService.theme()).toBe('dark');
  });

  it('should use system preference when localStorage is empty', async () => {
    // Mock system prefers light BEFORE creating service
    mockMatchMedia.mockImplementation((query: string) => ({
      matches: false, // Prefers light
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    // Create a new service instance to test initialization
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const newService = TestBed.inject(ThemeService);

    await Promise.resolve();
    expect(newService.theme()).toBe('light');
  });

  it('should set theme to dark via setTheme()', async () => {
    service.setTheme('dark');
    await Promise.resolve();
    expect(service.theme()).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('should set theme to light via setTheme()', async () => {
    service.setTheme('light');
    await Promise.resolve();
    expect(service.theme()).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('should store "dark" in localStorage when dark theme is set', () => {
    service.setTheme('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('should store "light" in localStorage when light theme is set', () => {
    service.setTheme('light');
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('should add dark class to document when theme is dark', async () => {
    service.setTheme('dark');
    await Promise.resolve();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('should remove dark class from document when theme is light', async () => {
    // First set to dark
    service.setTheme('dark');
    await Promise.resolve();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    // Then set to light
    service.setTheme('light');
    await Promise.resolve();
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('should not throw if setTheme called multiple times', () => {
    for (let i = 0; i < 10; i++) {
      expect(() => service.setTheme('dark')).not.toThrow();
      expect(() => service.setTheme('light')).not.toThrow();
    }
  });

  it('should handle theme changes correctly with effect', async () => {
    // Test that the effect properly updates DOM when theme changes
    service.setTheme('dark');
    await Promise.resolve();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    service.setTheme('light');
    await Promise.resolve();
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    service.setTheme('dark');
    await Promise.resolve();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
