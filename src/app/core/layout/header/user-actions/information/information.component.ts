import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { SubmenuDirective } from '../../../../../shared/directives/submenu/submenu.directive';

import { AuthService } from '../../../../auth/services/auth.service';
import { UserService } from '../../../../../shared/services/api/user/user.service';
import { ThemeService } from '../../../../../shared/services/core/theme/theme.service';

import { UserRoles } from '../../../../../shared/constants/user-roles.constant';

@Component({
  selector: 'header-information',
  standalone: true,
  imports: [RouterLink, SubmenuDirective],
  templateUrl: './information.component.html',
  styleUrl: './information.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InformationComponent {
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly themeService = inject(ThemeService);

  isFullScreen = input(false);

  clickOutside = output();
  toggleFullSCreen = output();

  readonly user = this.userService.currentUser;

  readonly isDarkMode = computed(() => {
    return this.themeService.isDarkMode();
  });

  readonly settingsLink = computed(() => {
    const role = this.user()?.roles[0];
    if (!role) return '/settings';

    return role === UserRoles.SCHOOL_ADMIN || role === UserRoles.SYSTEM_ADMIN
      ? '/school-admin/settings'
      : '/teacher/settings';
  });

  toggleDarkMode() {
    this.themeService.toggleDarkMode();
  }

  logout() {
    this.authService.logout().subscribe();
  }
}
