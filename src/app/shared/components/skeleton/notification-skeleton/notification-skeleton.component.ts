import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'notification-skeleton',
  standalone: true,
  imports: [SkeletonModule],
  templateUrl: './notification-skeleton.component.html',
  styleUrl: './notification-skeleton.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationSkeletonComponent {
  limit = input<number>(5);

  get skeletonItems() {
    return Array.from({ length: this.limit() });
  }
}
