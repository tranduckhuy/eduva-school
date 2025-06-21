import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
  computed,
} from '@angular/core';

import { HeaderSubmenuService } from '../../../../core/layout/header/services/header-submenu.service';
import { ThemeService } from '../../../../shared/services/theme/theme.service';

import { GenerateLessonSettingsComponent } from './generate-lesson-settings/generate-lesson-settings.component';

@Component({
  selector: 'generate-lesson-header',
  standalone: true,
  imports: [GenerateLessonSettingsComponent],
  templateUrl: './generate-lesson-header.component.html',
  styleUrl: './generate-lesson-header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenerateLessonHeaderComponent implements OnInit {
  readonly headerSubmenuService = inject(HeaderSubmenuService);
  readonly themeService = inject(ThemeService);

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
