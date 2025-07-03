import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly isDarkModeSignal = signal(false);
  isDarkMode = this.isDarkModeSignal.asReadonly();

  constructor() {
    const savedMode = localStorage.getItem('darkMode') === 'true';
    this.setDarkMode(savedMode);

    if (savedMode) {
      document.documentElement.classList.add('dark');
    }
  }

  setDarkMode(item: boolean) {
    this.isDarkModeSignal.set(item);
  }

  toggleDarkMode() {
    const newMode = !this.isDarkMode();
    this.isDarkModeSignal.set(newMode);

    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }
}
