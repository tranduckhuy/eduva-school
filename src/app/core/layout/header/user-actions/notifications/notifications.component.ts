import {
  ChangeDetectionStrategy,
  Component,
  inject,
  output,
} from '@angular/core';

import {
  FontAwesomeModule,
  FaIconLibrary,
} from '@fortawesome/angular-fontawesome';
import { faCommentDots } from '@fortawesome/free-regular-svg-icons';

import { SubmenuDirective } from '../../../../../shared/directives/submenu/submenu.directive';

@Component({
  selector: 'header-notifications',
  standalone: true,
  imports: [FontAwesomeModule, SubmenuDirective],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationsComponent {
  libIcon = inject(FaIconLibrary);

  clickOutside = output();

  constructor() {
    this.libIcon.addIcons(faCommentDots);
  }
}
