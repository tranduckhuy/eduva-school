import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';

import { UserService } from '../../../../shared/services/api/user/user.service';
import { ThemeService } from '../../../../shared/services/core/theme/theme.service';
import { HeaderSubmenuService } from '../services/header-submenu.service';

import { NotificationsComponent } from './notifications/notifications.component';
import { InformationComponent } from './information/information.component';

@Component({
  selector: 'header-user-actions',
  standalone: true,
  imports: [NotificationsComponent, InformationComponent],
  templateUrl: './user-actions.component.html',
  styleUrl: './user-actions.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserActionsComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly themeService = inject(ThemeService);
  readonly headerSubmenuService = inject(HeaderSubmenuService);

  readonly user = this.userService.currentUser;

  isFullscreen = signal(false);

  readonly isDarkMode = computed(() => {
    return this.themeService.isDarkMode();
  });

  ngOnInit(): void {
    document.addEventListener('fullscreenchange', () => {
      this.isFullscreen.set(!!document.fullscreenElement);
    });
  }

  toggleMenu(submenuKey: string): void {
    const current = this.headerSubmenuService.getActiveSubmenuMenu();
    if (current === submenuKey) {
      this.headerSubmenuService.close();
    } else {
      this.headerSubmenuService.open(submenuKey);
      setTimeout(() => this.headerSubmenuService.open(submenuKey));
    }
  }

  toggleFullscreen(): void {
    const docEl = document.documentElement;

    if (!document.fullscreenElement) {
      docEl.requestFullscreen?.().then(() => {
        this.isFullscreen.set(true);
      });
    } else {
      document.exitFullscreen?.().then(() => {
        this.isFullscreen.set(false);
      });
    }
  }

  toggleDarkMode() {
    this.themeService.toggleDarkMode();
  }
}
