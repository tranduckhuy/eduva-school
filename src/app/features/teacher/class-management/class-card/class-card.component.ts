import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

import { PAGE_SIZE } from '../../../../shared/constants/common.constant';

import { type ClassModel } from '../../../../shared/models/entities/class.model';

@Component({
  selector: 'class-card',
  standalone: true,
  imports: [RouterLink, ButtonModule, TooltipModule],
  templateUrl: './class-card.component.html',
  styleUrl: './class-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClassCardComponent {
  private readonly router = inject(Router);

  classModel = input.required<ClassModel>();
  currentPage = input<number>(1);
  pageSize = input<number>(PAGE_SIZE);

  goToClassDetail(id: string) {
    this.router.navigate(['/teacher/class-management', id], {
      queryParams: {
        page: this.currentPage(),
        pageSize: this.pageSize(),
      },
    });
  }
}
