import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from '../../../shared/services/theme/theme.service';

@Component({
  selector: 'app-blank-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <button
      class="fixed right-5 top-5 z-10 transition-colors duration-100 ease-linear hover:text-primary md:right-[25px] md:top-[25px]"
      (click)="toggleDarkMode()">
      <i class="material-symbols-outlined !text-xl md:!text-[22px]">
        {{ isDarkMode() ? 'light_mode' : 'dark_mode' }}
      </i>
    </button>
    <router-outlet />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlankLayoutComponent {
  readonly themeService = inject(ThemeService);

  readonly isDarkMode = computed(() => this.themeService.isDarkMode());

  toggleDarkMode() {
    this.themeService.toggleDarkMode();
  }
}
