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
  selector: 'header-information',
  standalone: true,
  imports: [SubmenuDirective],
  templateUrl: './information.component.html',
  styleUrl: './information.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InformationComponent {
  isFullScreen = input(false);

  clickOutside = output();
  toggleFullSCreen = output();

  private readonly themeService = inject(ThemeService);

  readonly isDarkMode = computed(() => {
    return this.themeService.isDarkMode();
  });

  toggleDarkMode() {
    this.themeService.toggleDarkMode();
  }
}
