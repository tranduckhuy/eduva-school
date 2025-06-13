import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
} from '@angular/core';

import {
  FontAwesomeModule,
  FaIconLibrary,
} from '@fortawesome/angular-fontawesome';
import {
  faGear,
  faArrowRightFromBracket,
} from '@fortawesome/free-solid-svg-icons';
import { faCircleUser } from '@fortawesome/free-regular-svg-icons';

import { SubmenuDirective } from '../../../../../shared/directives/submenu/submenu.directive';
import { ThemeService } from '../../../../../shared/services/theme/theme.service';

@Component({
  selector: 'header-information',
  standalone: true,
  imports: [FontAwesomeModule, SubmenuDirective],
  templateUrl: './information.component.html',
  styleUrl: './information.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InformationComponent {
  isFullScreen = input(false);

  clickOutside = output();
  toggleFullSCreen = output();

  libIcon = inject(FaIconLibrary);
  readonly themeService = inject(ThemeService);

  readonly isDarkMode = computed(() => {
    return this.themeService.isDarkMode();
  });

  constructor() {
    this.libIcon.addIcons(faCircleUser, faGear, faArrowRightFromBracket);
  }
  toggleDarkMode() {
    this.themeService.toggleDarkMode();
  }
}
