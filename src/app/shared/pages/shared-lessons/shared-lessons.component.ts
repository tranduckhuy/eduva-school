import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';

import { BytesToReadablePipe } from '../../pipes/byte-to-readable.pipe';

import { UserService } from '../../services/api/user/user.service';
import { LessonMaterialsService } from '../../services/api/lesson-materials/lesson-materials.service';
import { LoadingService } from '../../services/core/loading/loading.service';

import {
  ContentType,
  LessonMaterialStatus,
} from '../../models/enum/lesson-material.enum';
import { PAGE_SIZE } from '../../constants/common.constant';

import { ButtonComponent } from '../../components/button/button.component';
import {
  BadgeComponent,
  type BadgeVariant,
} from '../../components/badge/badge.component';
import { SearchInputComponent } from '../../components/search-input/search-input.component';
import { TableEmptyStateComponent } from '../../components/table-empty-state/table-empty-state.component';
import { TableSkeletonComponent } from '../../components/skeleton/table-skeleton/table-skeleton.component';

import { UserRoles } from '../../constants/user-roles.constant';

import { type LessonMaterial } from '../../models/entities/lesson-material.model';
import { type GetSharedLessonMaterialsRequest } from '../../models/api/request/query/get-lesson-materials-request.model';

@Component({
  selector: 'app-lessons',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    RouterLink,
    TableModule,
    TooltipModule,
    ButtonComponent,
    BytesToReadablePipe,
    BadgeComponent,
    SearchInputComponent,
    TableEmptyStateComponent,
    TableSkeletonComponent,
  ],
  templateUrl: './shared-lessons.component.html',
  styleUrl: './shared-lessons.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SharedLessonsComponent {
  private readonly userService = inject(UserService);
  private readonly lessonMaterialsService = inject(LessonMaterialsService);
  private readonly loadingService = inject(LoadingService);

  user = this.userService.currentUser;
  materials = this.lessonMaterialsService.lessonMaterials;
  totalRecords = this.lessonMaterialsService.totalRecords;
  isLoading = this.loadingService.is('get-materials');

  currentPage = signal(1);
  pageSize = signal(PAGE_SIZE);
  firstRecordIndex = signal(0);
  searchTerm = signal('');
  shouldStopRequest = signal<boolean>(true);

  tableHeadSkeleton = signal([
    'Tài liệu bài học',
    'Người sở hữu',
    'Ngày tạo tài liệu',
    'Kích thước tệp',
    'Chia sẻ',
    'Hành động',
  ]);

  viewLessonLink = computed(() =>
    this.user()?.roles.includes(UserRoles.SCHOOL_ADMIN)
      ? '/school-admin/view-lesson'
      : '/teacher/view-lesson'
  );

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

  getMaterialStatusLabel(status: LessonMaterialStatus): string {
    switch (status) {
      case LessonMaterialStatus.Pending:
        return 'Chờ duyệt';
      case LessonMaterialStatus.Approved:
        return 'Đã duyệt';
      case LessonMaterialStatus.Rejected:
        return 'Từ chối';
      default:
        return 'Không xác định';
    }
  }

  getMaterialStatusBadge(status: LessonMaterialStatus): BadgeVariant {
    switch (status) {
      case LessonMaterialStatus.Approved:
        return 'success';
      case LessonMaterialStatus.Pending:
        return 'warning';
      case LessonMaterialStatus.Rejected:
        return 'danger';
      default:
        return 'gray';
    }
  }

  private loadMaterials(): void {
    if (this.shouldStopRequest()) return;

    const request: GetSharedLessonMaterialsRequest = {
      searchTerm: this.searchTerm(),
      pageIndex: this.currentPage(),
      pageSize: this.pageSize(),
    };

    this.lessonMaterialsService.getSharedLessonMaterials(request).subscribe({
      error: () => this.shouldStopRequest.set(true),
    });
  }
}
