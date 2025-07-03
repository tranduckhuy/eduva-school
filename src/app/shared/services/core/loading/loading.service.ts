import { Injectable, computed, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private readonly loadingMap = signal<Record<string, boolean>>({});

  readonly isLoading = computed(() =>
    Object.values(this.loadingMap()).some(val => val === true)
  );

  is(key: string = 'default') {
    return computed(() => this.loadingMap()[key] ?? false);
  }

  start(key: string = 'default') {
    this.loadingMap.set({
      ...this.loadingMap(),
      [key]: true,
    });
  }

  stop(key: string = 'default') {
    this.loadingMap.set({
      ...this.loadingMap(),
      [key]: false,
    });
  }

  reset() {
    this.loadingMap.set({});
  }
}
