import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  signal,
} from '@angular/core';

import { DateDisplayService } from './services/date-display.service';

import { BreadcrumbsComponent } from '../../../shared/components/breadcrumbs/breadcrumbs.component';

@Component({
  selector: 'app-layout-heading',
  standalone: true,
  imports: [BreadcrumbsComponent],
  templateUrl: './layout-heading.component.html',
  styleUrl: './layout-heading.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutHeadingComponent {
  heading = input.required<string>();

  private readonly dateDisplayService = inject(DateDisplayService);
  showDate = this.dateDisplayService.showDate;

  currentDate = signal(
    new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date())
  );
}
