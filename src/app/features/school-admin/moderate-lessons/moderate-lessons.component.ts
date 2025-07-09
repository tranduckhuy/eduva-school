import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';

import { BytesToReadablePipe } from '../../../shared/pipes/byte-to-readable.pipe';

import { LessonMaterialsService } from '../../../shared/services/api/lesson-materials/lesson-materials.service';
import { LoadingService } from '../../../shared/services/core/loading/loading.service';

import { PAGE_SIZE } from '../../../shared/constants/common.constant';
import { ContentType } from '../../../shared/models/enum/lesson-material.enum';

import { ButtonComponent } from '../../../shared/components/button/button.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { SearchInputComponent } from '../../../shared/components/search-input/search-input.component';
import { TableSkeletonComponent } from '../../../shared/components/skeleton/table-skeleton/table-skeleton.component';
import { TableEmptyStateComponent } from '../../../shared/components/table-empty-state/table-empty-state.component';

import { type LessonMaterial } from '../../../shared/models/entities/lesson-material.model';
import { type GetPendingLessonMaterialsRequest } from '../../../shared/models/api/request/query/get-lesson-materials-request.model';

@Component({
  selector: 'app-lessons',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    RouterLink,
    BytesToReadablePipe,
    TableModule,
    TooltipModule,
    ButtonComponent,
    BadgeComponent,
    SearchInputComponent,
    TableSkeletonComponent,
    TableEmptyStateComponent,
  ],
  templateUrl: './moderate-lessons.component.html',
  styleUrl: './moderate-lessons.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModerateLessonsComponent {
  private readonly lessonMaterialsService = inject(LessonMaterialsService);
  private readonly loadingService = inject(LoadingService);

  materials = this.lessonMaterialsService.lessonMaterials;
  totalRecords = this.lessonMaterialsService.totalRecords;
  isLoading = this.loadingService.is('get-materials');

  currentPage = signal(1);
  pageSize = signal(PAGE_SIZE);
  firstRecordIndex = signal(0);
  searchTerm = signal('');

  tableHeadSkeleton = signal([
    'Tài liệu bài học',
    'Người tạo tài liệu',
    'Ngày tạo tài liệu',
    'Kích thước tệp',
    'Trạng thái',
    'Hành động',
  ]);

  ngOnInit(): void {
    this.onSearch();
  }

  onLazyLoad(event: TableLazyLoadEvent): void {
    const rows = event.rows ?? this.pageSize();
    const first = event.first ?? 0;
    const page = Math.floor(first / rows) + 1;

    this.currentPage.set(page);
    this.pageSize.set(rows);
    this.firstRecordIndex.set(first);

    this.loadMaterials();
  }

  onSearch(term?: string): void {
    this.searchTerm.set(term ?? '');
    this.currentPage.set(1);
    this.firstRecordIndex.set(0);

    this.loadMaterials();
  }

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

  private loadMaterials(): void {
    const request: GetPendingLessonMaterialsRequest = {
      searchTerm: this.searchTerm(),
      pageIndex: this.currentPage(),
      pageSize: this.pageSize(),
    };

    this.lessonMaterialsService.getPendingLessonMaterials(request).subscribe();
  }
}
