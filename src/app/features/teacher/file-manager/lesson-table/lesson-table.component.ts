import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { TooltipModule } from 'primeng/tooltip';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmationService } from 'primeng/api';

import { LoadingService } from '../../../../shared/services/core/loading/loading.service';
import { GlobalModalService } from '../../../../shared/services/layout/global-modal/global-modal.service';
import { FolderManagementService } from '../../../../shared/services/api/folder/folder-management.service';

import { PAGE_SIZE } from '../../../../shared/constants/common.constant';
import { FolderOwnerType } from '../../../../shared/models/enum/folder-owner-type.enum';
import { EntityStatus } from '../../../../shared/models/enum/entity-status.enum';

import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { GetFoldersRequest } from '../../../../shared/models/api/request/query/get-folders-request.model';
import { SearchInputComponent } from '../../../../shared/components/search-input/search-input.component';
import { TableSkeletonComponent } from '../../../../shared/components/skeleton/table-skeleton/table-skeleton.component';
import { TableEmptyStateComponent } from '../../../../shared/components/table-empty-state/table-empty-state.component';
import { AddLessonModalComponent } from '../../../../shared/components/add-lesson-modal/add-lesson-modal.component';
import { RenameLessonModalComponent } from '../../../../shared/components/rename-lesson-modal/rename-lesson-modal.component';

@Component({
  selector: 'lesson-table',
  standalone: true,
  imports: [
    InputTextModule,
    DatePipe,
    TooltipModule,
    TableModule,
    ButtonComponent,
    SearchInputComponent,
    TableSkeletonComponent,
    TableEmptyStateComponent,
  ],
  templateUrl: './lesson-table.component.html',
  styleUrl: './lesson-table.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LessonTableComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly loadingService = inject(LoadingService);
  private readonly globalModalService = inject(GlobalModalService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly folderService = inject(FolderManagementService);

  folders = this.folderService.folderList;
  totalRecords = this.folderService.totalRecords;
  isLoading = this.loadingService.is('get-folders');

  currentPage = signal(1);
  pageSize = signal(PAGE_SIZE);
  firstRecordIndex = signal(0);
  searchValue = signal('');
  shouldStopRequest = signal<boolean>(true);

  tableHeadSkeleton = signal([
    'Thư mục bài học',
    'Người sở hữu',
    'Lần sửa đổi cuối cùng',
    'Kích thước tệp',
    'Hành động',
  ]);

  ngOnInit(): void {
    this.activatedRoute.queryParamMap.subscribe(params => {
      const page = Number(params.get('page'));
      const size = Number(params.get('pageSize'));

      if (page && size) {
        this.currentPage.set(!isNaN(page) && page > 0 ? page : 1);
        this.pageSize.set(!isNaN(size) && size > 0 ? size : PAGE_SIZE);
      }

      const firstIndex = (this.currentPage() - 1) * this.pageSize();
      this.firstRecordIndex.set(firstIndex);
    });
  }

  onLazyLoad(event: TableLazyLoadEvent): void {
    const first = event.first ?? 0;
    const rows = event.rows ?? this.pageSize();
    const page = Math.floor(first / rows) + 1;

    this.currentPage.set(page);
    this.pageSize.set(rows);
    this.firstRecordIndex.set(first);

    this.fetchFolders();
  }

  onSearch(searchTerm?: string): void {
    this.searchValue.set(searchTerm ?? '');
    this.currentPage.set(1);
    this.firstRecordIndex.set(0);

    this.fetchFolders();
  }

  onArchiveFolder(folderId: string) {
    this.confirmationService.confirm({
      header: 'Chuyển vào thùng rác?',
      message:
        'Thư mục này sẽ được chuyển vào thùng rác. Bạn có chắc chắn muốn tiếp tục?',
      icon: 'pi pi-info-circle',
      rejectButtonProps: {
        label: 'Không, giữ lại',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Có, chuyển vào thùng rác',
        severity: 'danger',
      },
      accept: () => {
        this.folderService.archiveFolder(folderId).subscribe({
          next: () => this.onSearch(),
        });
      },
    });
  }

  onRenameFolder(folderId: string, folderName: string) {
    this.globalModalService.open(RenameLessonModalComponent, {
      folderId,
      folderName,
      renameLessonSuccess: () => {
        this.onSearch();
      },
    });
  }

  openAddFolderModal(): void {
    this.globalModalService.open(AddLessonModalComponent, {
      ownerType: FolderOwnerType.Personal,
      addLessonSuccess: () => {
        this.onSearch();
      },
    });
  }

  goToFolderMaterials(folderId: string): void {
    this.router.navigate([folderId], {
      relativeTo: this.activatedRoute,
      queryParams: {
        page: this.currentPage(),
        pageSize: this.pageSize(),
      },
    });
  }

  private fetchFolders(): void {
    if (!this.shouldStopRequest()) return;

    const request: GetFoldersRequest = {
      name: this.searchValue(),
      pageIndex: this.currentPage(),
      pageSize: this.pageSize(),
      status: EntityStatus.Active,
      sortBy: 'lastModifiedAt',
      sortDirection: 'desc',
    };

    this.folderService.getPersonalFolders(request).subscribe({
      error: () => this.shouldStopRequest.set(false),
    });
  }
}
