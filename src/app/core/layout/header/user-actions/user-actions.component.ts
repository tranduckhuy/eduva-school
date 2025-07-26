import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';

import { ThemeService } from '../../../../shared/services/core/theme/theme.service';
import { HeaderSubmenuService } from '../services/header-submenu.service';
import { UserService } from '../../../../shared/services/api/user/user.service';
import { NotificationService } from '../../../../shared/services/api/notification/notification.service';
import { NotificationSocketService } from '../../../../shared/services/api/notification/notification-socket.service';

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
  private readonly destroyRef = inject(DestroyRef);
  private readonly themeService = inject(ThemeService);
  private readonly headerSubmenuService = inject(HeaderSubmenuService);
  private readonly userService = inject(UserService);
  private readonly notificationService = inject(NotificationService);
  private readonly notificationSocketService = inject(
    NotificationSocketService
  );

  theme = this.themeService.theme;
  user = this.userService.currentUser;
  unreadCount = this.notificationService.unreadCount;

  isFullscreen = signal(false);

  readonly hasUnreadNotification = computed(() => this.unreadCount() > 0);
  readonly isDarkMode = computed(() => this.theme() === 'dark');

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.notificationSocketService.disconnect();
    });
  }

  ngOnInit(): void {
    document.addEventListener('fullscreenchange', () => {
      this.isFullscreen.set(!!document.fullscreenElement);
    });

    this.notificationSocketService.connect();
    this.notificationService.getNotificationSummary().subscribe();
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

  toggleTheme() {
    this.theme() === 'light'
      ? this.themeService.setTheme('dark')
      : this.themeService.setTheme('light');
  }

  getActiveSubmenuMenu(menuName: string) {
    return this.headerSubmenuService.getActiveSubmenuMenu() === menuName;
  }

  closeSubmenu() {
    this.headerSubmenuService.close();
  }
}
