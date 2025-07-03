import { Injectable, signal } from '@angular/core';

import { MenuItem } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class BreadcrumbsService {
  private readonly breadcrumbsSignal = signal<MenuItem[]>([]);
  breadcrumbs = this.breadcrumbsSignal.asReadonly();

  setBreadcrumbs(items: MenuItem[]) {
    this.breadcrumbsSignal.set(items);
  }
}
