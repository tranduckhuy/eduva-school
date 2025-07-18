import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  input,
  signal,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { TooltipModule } from 'primeng/tooltip';
import { TableModule } from 'primeng/table';

import { BytesToReadablePipe } from '../../../../shared/pipes/byte-to-readable.pipe';

import { GlobalModalService } from '../../../../shared/services/layout/global-modal/global-modal.service';
import { LoadingService } from '../../../../shared/services/core/loading/loading.service';
import { LessonMaterialsService } from '../../../../shared/services/api/lesson-materials/lesson-materials.service';

import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { SearchInputComponent } from '../../../../shared/components/search-input/search-input.component';
import { AddFileModalComponent } from '../add-file-modal/add-file-modal.component';
import { TableSkeletonComponent } from '../../../../shared/components/skeleton/table-skeleton/table-skeleton.component';
import { TableEmptyStateComponent } from '../../../../shared/components/table-empty-state/table-empty-state.component';
import {
  BadgeComponent,
  BadgeVariant,
} from '../../../../shared/components/badge/badge.component';

import { PAGE_SIZE } from '../../../../shared/constants/common.constant';
import {
  ContentType,
  LessonMaterialStatus,
} from '../../../../shared/models/enum/lesson-material.enum';

import { type LessonMaterial } from '../../../../shared/models/entities/lesson-material.model';
import { type GetLessonMaterialsRequest } from '../../../../shared/models/api/request/query/get-lesson-materials-request.model';

@Component({
  selector: 'material-table',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    RouterLink,
    TooltipModule,
    TableModule,
    ButtonComponent,
    BadgeComponent,
    SearchInputComponent,
    TableSkeletonComponent,
    TableEmptyStateComponent,
    BytesToReadablePipe,
  ],
  templateUrl: './material-table.component.html',
  styleUrl: './material-table.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MaterialTableComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly globalModalService = inject(GlobalModalService);
  private readonly loadingService = inject(LoadingService);
  private readonly lessonMaterialsService = inject(LessonMaterialsService);

  folderId = input.required<string>();

  materials = this.lessonMaterialsService.lessonMaterials;
  totalRecords = this.lessonMaterialsService.totalRecords;
  isLoading = this.loadingService.is('get-materials');

  searchTerm = signal('');

  previousPage = signal(1);
  previousPageSize = signal(PAGE_SIZE);

  tableHeadSkeleton = signal([
    'Tài liệu bài học',
    'Người tạo tài liệu',
    'Lần sửa đổi cuối cùng',
    'Kích thước tệp',
    'Trạng thái',
    'Chia sẻ',
    'Hành động',
  ]);

  ngOnInit(): void {
    this.activatedRoute.queryParamMap.subscribe(params => {
      const page = Number(params.get('page'));
      const size = Number(params.get('pageSize'));

      if (!isNaN(page) && page > 0) {
        this.previousPage.set(page);
      }

      if (!isNaN(size) && size > 0) {
        this.previousPageSize.set(size);
      }
    });

    this.onSearch();
  }

  onSearch(term?: string): void {
    this.searchTerm.set(term ?? '');

    const request: GetLessonMaterialsRequest = {
      searchTerm: this.searchTerm(),
    };
    this.lessonMaterialsService
      .getLessonMaterials(this.folderId(), request)
      .subscribe();
  }

  openAddMaterialModal(): void {
    this.globalModalService.open(AddFileModalComponent, {
      folderId: this.folderId(),
    });
  }

  goBackToLessonList(): void {
    this.router.navigate(['/teacher/file-manager'], {
      queryParams: {
        page: this.previousPage(),
        pageSize: this.previousPageSize(),
      },
    });
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
      case LessonMaterialStatus.Pending:
        return 'info';
      case LessonMaterialStatus.Approved:
        return 'success';
      case LessonMaterialStatus.Rejected:
        return 'danger';
      default:
        return 'gray';
    }
  }
}
