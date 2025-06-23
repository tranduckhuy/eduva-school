import { Injectable, computed, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private loadingCount = signal(0);
  readonly isLoading = computed(() => this.loadingCount() > 0);

  start() {
    this.loadingCount.set(this.loadingCount() + 1);
  }

  stop() {
    const current = this.loadingCount();
    this.loadingCount.set(current > 0 ? current - 1 : 0);
  }

  reset() {
    this.loadingCount.set(0);
  }
}
