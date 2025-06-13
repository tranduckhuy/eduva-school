import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HeaderSubmenuService {
  private readonly activeSubmenu = signal<string | null>(null);

  getActiveSubmenuMenu = this.activeSubmenu.asReadonly();

  open(submenuKey: string) {
    this.activeSubmenu.set(submenuKey);
  }

  close() {
    this.activeSubmenu.set(null);
  }

  toggle(submenuKey: string) {
    this.activeSubmenu.set(
      this.activeSubmenu() === submenuKey ? null : submenuKey
    );
  }

  isActive(submenuKey: string): boolean {
    return this.activeSubmenu() === submenuKey;
  }
}
