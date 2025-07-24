import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink, NavigationEnd } from '@angular/router';

import { filter } from 'rxjs';

import { UserActionsComponent } from '../../../../core/layout/header/user-actions/user-actions.component';

@Component({
  selector: 'generate-lesson-header',
  standalone: true,
  imports: [RouterLink, UserActionsComponent],
  templateUrl: './generate-lesson-header.component.html',
  styleUrl: './generate-lesson-header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenerateLessonHeaderComponent {
  private readonly router = inject(Router);

  private readonly currentUrl = signal(this.router.url);

  readonly isInGeneratedRoute = computed(() =>
    this.currentUrl().includes('/generate-lesson/generated')
  );

  constructor() {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(e => {
        this.currentUrl.set(e.urlAfterRedirects);
      });
  }
}
