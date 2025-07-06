import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { AuthService } from '../../../../core/auth/services/auth.service';

@Component({
  selector: 'app-subscription-expired',
  standalone: true,
  imports: [],
  templateUrl: './subscription-expired.component.html',
  styleUrl: './subscription-expired.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubscriptionExpiredComponent {
  private readonly authService = inject(AuthService);

  onLogout() {
    this.authService.logout().subscribe();
  }
}
