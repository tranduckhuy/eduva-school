import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  inject,
} from '@angular/core';

import { SubmenuDirective } from '../../../../../shared/directives/submenu/submenu.directive';

import { ThemeService } from '../../../../../shared/services/core/theme/theme.service';
import { AuthService } from '../../../../auth/services/auth.service';

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

  private readonly authService = inject(AuthService);
  private readonly themeService = inject(ThemeService);

  readonly isDarkMode = computed(() => {
    return this.themeService.isDarkMode();
  });

  toggleDarkMode() {
    this.themeService.toggleDarkMode();
  }

  logout() {
    this.authService.logout().subscribe();
  }
}
