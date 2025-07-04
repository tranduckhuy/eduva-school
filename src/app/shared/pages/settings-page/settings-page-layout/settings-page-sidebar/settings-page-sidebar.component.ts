import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { UserService } from '../../../../services/api/user/user.service';

import { UserRoles } from '../../../../constants/user-roles.constant';

@Component({
  selector: 'settings-page-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './settings-page-sidebar.component.html',
  styleUrl: './settings-page-sidebar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPageSidebarComponent {
  private readonly userService = inject(UserService);

  user = this.userService.currentUser;
  isSchoolAdmin = computed(() =>
    this.user()?.roles.includes(UserRoles.SCHOOL_ADMIN)
  );
}
