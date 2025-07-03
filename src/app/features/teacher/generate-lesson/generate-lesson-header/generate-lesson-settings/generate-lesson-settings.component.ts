import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
} from '@angular/core';

import { SubmenuDirective } from '../../../../../shared/directives/submenu/submenu.directive';

import { ThemeService } from '../../../../../shared/services/core/theme/theme.service';

@Component({
  selector: 'generate-lesson-settings',
  standalone: true,
  imports: [SubmenuDirective],
  templateUrl: './generate-lesson-settings.component.html',
  styleUrl: './generate-lesson-settings.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenerateLessonSettingsComponent {
  isFullScreen = input(false);

  clickOutside = output<void>();
  toggleFullSCreen = output<void>();

  private readonly themeService = inject(ThemeService);

  readonly isDarkMode = computed(() => {
    return this.themeService.isDarkMode();
  });

  toggleDarkMode() {
    this.themeService.toggleDarkMode();
  }
}
