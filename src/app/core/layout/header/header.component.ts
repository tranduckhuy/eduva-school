import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { UserService } from '../../../shared/services/api/user/user.service';

import { UserActionsComponent } from './user-actions/user-actions.component';
import { UserRoles } from '../../../shared/constants/user-roles.constant';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, UserActionsComponent, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  private readonly userService = inject(UserService);

  isManuallyToggled = input<boolean>(true);
  isSmallScreen = input<boolean>(false);

  toggleSidebar = output();

  user = this.userService.currentUser;

  get routerLinkRole() {
    const link = this.user()?.roles.includes(UserRoles.SCHOOL_ADMIN)
      ? '/school-admin'
      : '/teacher';
    return link;
  }
}
