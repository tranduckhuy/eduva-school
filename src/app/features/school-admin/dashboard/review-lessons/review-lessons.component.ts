import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';

import { type DashboardSchoolAdminResponse } from '../../../../shared/models/api/response/query/dashboard-sa-response.model';
import { LessonMaterial } from '../../../../shared/models/entities/lesson-material.model';
import { ContentType } from '../../../../shared/models/enum/lesson-material.enum';
import { TableEmptyStateComponent } from '../../../../shared/components/table-empty-state/table-empty-state.component';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';

@Component({
  selector: 'app-review-lessons',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    RouterLink,
    TooltipModule,
    TableEmptyStateComponent,
    BadgeComponent,
  ],
  templateUrl: './review-lessons.component.html',
  styleUrl: './review-lessons.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewLessonsComponent {
  readonly lessons =
    input.required<DashboardSchoolAdminResponse['reviewLessons']>();

  getMaterialIcon(material: LessonMaterial): string {
    switch (material.contentType) {
      case ContentType.Video:
        return 'movie';
      case ContentType.Audio:
        return 'volume_up';
      case ContentType.DOCX:
        return 'description';
      case ContentType.PDF:
      default:
        return 'picture_as_pdf';
    }
  }

  getMaterialIconColor(material: LessonMaterial): string {
    switch (material.contentType) {
      case ContentType.Video:
        return 'text-purple';
      case ContentType.Audio:
        return 'text-green-500';
      case ContentType.DOCX:
        return 'text-primary';
      case ContentType.PDF:
      default:
        return 'text-orange';
    }
  }
}
