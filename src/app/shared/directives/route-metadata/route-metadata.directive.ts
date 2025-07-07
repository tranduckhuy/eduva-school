import { Directive, OnInit, inject } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';

import { filter } from 'rxjs';

import { MenuItem } from 'primeng/api';

import { LayoutHeadingService } from '../../services/layout/layout-heading/layout-heading.service';
import { BreadcrumbsService } from '../../services/layout/breadcrumbs/breadcrumbs.service';
import { DateDisplayService } from '../../../core/layout/layout-heading/services/date-display.service';

@Directive({
  selector: '[routeMetadata]',
  standalone: true,
})
export class RouteMetadataDirective implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly layoutHeadingService = inject(LayoutHeadingService);
  private readonly breadcrumbService = inject(BreadcrumbsService);
  private readonly dateDisplayService = inject(DateDisplayService);

  ngOnInit(): void {
    this.updateMetadata();

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateMetadata();
      });
  }

  private updateMetadata() {
    // ? HEADING
    let current = this.route;
    while (current.firstChild) {
      current = current.firstChild;
    }

    const heading = current.snapshot.data['heading'];
    this.layoutHeadingService.setHeading(heading ?? '');

    // ? BREADCRUMBS
    const breadcrumbs: MenuItem[] = [];
    let activeRoute = this.router.routerState.root;
    let url = '';

    while (activeRoute.firstChild) {
      activeRoute = activeRoute.firstChild;
      const snapshot = activeRoute.snapshot;

      const label = snapshot.data['breadcrumb'];
      const tooltip = snapshot.data['heading'];

      if (snapshot.routeConfig?.path) {
        url += '/' + snapshot.routeConfig.path;
      }

      if (label) {
        breadcrumbs.push({
          label,
          tooltip,
          routerLink: url,
        });
      }
    }

    this.breadcrumbService.setBreadcrumbs([
      {
        label: 'Bảng thống kê',
        icon: 'pi pi-home',
        routerLink: '/',
      },
      ...breadcrumbs,
    ]);

    // ? Show Date instead of Breadcrumbs if on Dashboard/Home page
    const isHome = breadcrumbs.length === 0;
    const isOnlyDashboard =
      breadcrumbs.length === 1 && breadcrumbs[0].label === 'Bảng thống kê';

    this.dateDisplayService.setShowDate(isHome || isOnlyDashboard);
  }
}
