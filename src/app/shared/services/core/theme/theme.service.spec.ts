import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    // Clear DOM class and localStorage before each test
    document.documentElement.classList.remove('dark');
    localStorage.clear();

    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should default to light mode (false)', () => {
    expect(service.isDarkMode()).toBe(false);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('should initialize with dark mode if localStorage is "true"', () => {
    localStorage.setItem('darkMode', 'true');
    const newService = new ThemeService(); // manually re-init

    expect(newService.isDarkMode()).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('should set dark mode to true via setDarkMode()', () => {
    service.setDarkMode(true);
    expect(service.isDarkMode()).toBe(true);
  });

  it('should set dark mode to false via setDarkMode()', () => {
    service.setDarkMode(false);
    expect(service.isDarkMode()).toBe(false);
  });

  it('should toggle from light to dark', () => {
    service.setDarkMode(false);
    service.toggleDarkMode();
    expect(service.isDarkMode()).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('darkMode')).toBe('true');
  });

  it('should toggle from dark to light', () => {
    service.setDarkMode(true);
    document.documentElement.classList.add('dark');
    localStorage.setItem('darkMode', 'true');

    service.toggleDarkMode();
    expect(service.isDarkMode()).toBe(false);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('darkMode')).toBe('false');
  });

  it('should store "darkMode=true" in localStorage when enabled', () => {
    service.setDarkMode(false);
    service.toggleDarkMode();
    expect(localStorage.getItem('darkMode')).toBe('true');
  });

  it('should store "darkMode=false" in localStorage when disabled', () => {
    service.setDarkMode(true);
    service.toggleDarkMode();
    expect(localStorage.getItem('darkMode')).toBe('false');
  });

  it('should not throw if toggle called multiple times', () => {
    for (let i = 0; i < 10; i++) {
      expect(() => service.toggleDarkMode()).not.toThrow();
    }
  });
});
