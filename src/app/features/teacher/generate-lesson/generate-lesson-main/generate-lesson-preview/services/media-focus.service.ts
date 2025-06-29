import { Injectable, computed, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MediaFocusService {
  private readonly activeId = signal<string | null>(null);

  setActive(id: string) {
    this.activeId.set(id);
  }

  isActive(id: string) {
    return computed(() => this.activeId() === id);
  }
}
