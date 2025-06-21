import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

import { ThemeService } from '../../../shared/services/theme/theme.service';
import { GlobalModalHostComponent } from '../../../shared/components/global-modal-host/global-modal-host.component';

@Component({
  selector: 'app-blank-layout',
  standalone: true,
  imports: [RouterOutlet, GlobalModalHostComponent],
  template: `
    <router-outlet />

    <app-global-modal-host />

    @if (showThemeButton()) {
      <button
        class="fixed right-5 top-5 z-10 transition-colors duration-100 ease-linear hover:text-primary md:right-[25px] md:top-[25px]"
        (click)="toggleDarkMode()">
        <i class="material-symbols-outlined !text-xl md:!text-[22px]">
          {{ isDarkMode() ? 'light_mode' : 'dark_mode' }}
        </i>
      </button>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlankLayoutComponent {
  private readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);

  private readonly hiddenPaths = ['/generate-lesson'];

  private readonly currentUrl = signal(this.router.url);

  constructor() {
    effect(
      () => {
        this.currentUrl.set(this.router.url);
      },
      { allowSignalWrites: true }
    );
  }

  readonly showThemeButton = computed(() => {
    return !this.hiddenPaths.some(path => this.currentUrl().includes(path));
  });

  readonly isDarkMode = computed(() => this.themeService.isDarkMode());

  toggleDarkMode() {
    this.themeService.toggleDarkMode();
  }
}
