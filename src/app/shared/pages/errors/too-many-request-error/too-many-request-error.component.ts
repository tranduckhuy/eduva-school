import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  DestroyRef,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-too-many-request-error',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './too-many-request-error.component.html',
  styleUrl: './too-many-request-error.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooManyRequestErrorComponent {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  waitTimeMinutes = signal<number>(1);
  remainingSeconds = signal<number>(0);

  displayRemainingTime = computed(() => {
    const seconds = this.remainingSeconds();

    if (seconds <= 0) {
      return '00:00';
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  });

  private countdownTimer: any;
  private readonly STORAGE_KEY = 'rate_limit_countdown';

  constructor() {
    this.activatedRoute.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        const waitTime = params['waitTime'];
        const parsedWaitTime = Number(waitTime);

        if (waitTime && !isNaN(parsedWaitTime) && parsedWaitTime > 0) {
          this.waitTimeMinutes.set(parsedWaitTime);
          this.initializeCountdown(parsedWaitTime * 60);
        } else {
          this.waitTimeMinutes.set(1);
          this.initializeCountdown(60);
        }
      });

    this.destroyRef.onDestroy(() => {
      if (this.countdownTimer) {
        clearInterval(this.countdownTimer);
      }
      const currentSeconds = this.remainingSeconds();
      if (currentSeconds > 0) {
        this.saveCountdown(currentSeconds);
      }
    });
  }

  private initializeCountdown(totalSeconds: number) {
    const savedCountdown = this.getSavedCountdown();

    if (savedCountdown && savedCountdown.remainingSeconds > 0) {
      this.startCountdown(savedCountdown.remainingSeconds);
    } else {
      this.startCountdown(totalSeconds);
    }
  }

  private getSavedCountdown(): {
    remainingSeconds: number;
    timestamp: number;
  } | null {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const countdown = JSON.parse(saved);
        const now = Date.now();

        if (now - countdown.timestamp < 24 * 60 * 60 * 1000) {
          return countdown;
        } else {
          localStorage.removeItem(this.STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error('Error reading countdown from localStorage:', error);
    }
    return null;
  }

  private saveCountdown(remainingSeconds: number) {
    try {
      const countdown = {
        remainingSeconds,
        timestamp: Date.now(),
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(countdown));
    } catch (error) {
      console.error('Error saving countdown to localStorage:', error);
    }
  }

  private clearSavedCountdown() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing countdown from localStorage:', error);
    }
  }

  private startCountdown(totalSeconds: number) {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
    }

    this.remainingSeconds.set(totalSeconds);

    this.countdownTimer = setInterval(() => {
      const currentSeconds = this.remainingSeconds();

      if (currentSeconds > 0) {
        const newSeconds = currentSeconds - 1;
        this.remainingSeconds.set(newSeconds);
        this.saveCountdown(newSeconds);
      } else {
        clearInterval(this.countdownTimer);
        this.countdownTimer = null;
        this.clearSavedCountdown();
      }
    }, 1000);
  }
}
