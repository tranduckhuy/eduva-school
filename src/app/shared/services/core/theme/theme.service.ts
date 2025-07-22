import {
  inject,
  Injectable,
  RendererFactory2,
  PLATFORM_ID,
  effect,
  signal,
} from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly THEME = 'theme';
  private readonly _platformId = inject(PLATFORM_ID);
  private readonly _renderer = inject(RendererFactory2).createRenderer(
    null,
    null
  );
  private readonly _document = inject(DOCUMENT);

  private readonly _theme = signal<Theme>('light');
  theme = this._theme.asReadonly();

  constructor() {
    this._syncThemeFromLocalStorage();
    this._toggleClassOnThemeChange();
  }

  private _syncThemeFromLocalStorage(): void {
    if (isPlatformBrowser(this._platformId)) {
      const saved = localStorage.getItem(this.THEME);
      if (saved === 'light' || saved === 'dark') {
        this._theme.set(saved);
      } else {
        const prefersDark = window.matchMedia?.(
          '(prefers-color-scheme: dark)'
        ).matches;
        this._theme.set(prefersDark ? 'dark' : 'light');
      }
    }
  }

  private _toggleClassOnThemeChange(): void {
    effect(() => {
      const theme = this._theme();
      const el = this._document.documentElement;

      if (theme === 'dark') {
        this._renderer.addClass(el, 'dark');
      } else {
        this._renderer.removeClass(el, 'dark');
      }
    });
  }

  public setTheme(theme: Theme) {
    localStorage.setItem(this.THEME, theme);
    this._theme.set(theme);
  }
}
