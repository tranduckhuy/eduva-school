import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserActionsComponent } from './user-actions/user-actions.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [UserActionsComponent, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  isManuallyToggled = input<boolean>(true);
  isSmallScreen = input<boolean>(false);
  toggleSidebar = output();
}
