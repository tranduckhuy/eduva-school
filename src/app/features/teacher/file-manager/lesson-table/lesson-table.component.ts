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

import { GlobalModalService } from '../../../../shared/services/layout/global-modal/global-modal.service';
import { LoadingService } from '../../../../shared/services/core/loading/loading.service';

import { PAGE_SIZE } from '../../../../shared/constants/common.constant';
import { FolderOwnerType } from '../../../../shared/models/enum/folder-owner-type.enum';

import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { FolderManagementService } from '../../../../shared/services/api/folder/folder-management.service';
import { GetFoldersRequest } from '../../../../shared/models/api/request/query/get-folders-request.model';
import { AddLessonModalComponent } from '../../../../shared/components/add-lesson-modal/add-lesson-modal.component';
import { SearchInputComponent } from '../../../../shared/components/search-input/search-input.component';
import { TableSkeletonComponent } from '../../../../shared/components/skeleton/table-skeleton/table-skeleton.component';
import { TableEmptyStateComponent } from '../../../../shared/components/table-empty-state/table-empty-state.component';

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
  private readonly route = inject(ActivatedRoute);
  private readonly modalService = inject(GlobalModalService);
  private readonly loadingService = inject(LoadingService);
  private readonly folderService = inject(FolderManagementService);

  folders = this.folderService.folderList;
  totalRecords = this.folderService.totalRecords;
  isLoading = this.loadingService.is('get-folders');

  currentPage = signal(1);
  pageSize = signal(PAGE_SIZE);
  firstRecordIndex = signal(0);
  searchValue = signal('');

  tableHeadSkeleton = signal([
    'Thư mục bài học',
    'Người sở hữu',
    'Lần sửa đổi cuối cùng',
    'Kích thước tệp',
    'Hành động',
  ]);

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const page = Number(params.get('page'));
      const size = Number(params.get('pageSize'));

      this.currentPage.set(!isNaN(page) && page > 0 ? page : 1);
      this.pageSize.set(!isNaN(size) && size > 0 ? size : PAGE_SIZE);

      const firstIndex = (this.currentPage() - 1) * this.pageSize();
      this.firstRecordIndex.set(firstIndex);

      this.loadFolders();
    });
  }

  onSearch(value: string): void {
    this.searchValue.set(value);
    this.currentPage.set(1);
    this.firstRecordIndex.set(0);

    this.loadFolders();
  }

  onLazyLoadLessons(event: TableLazyLoadEvent): void {
    const rows = event.rows ?? this.pageSize();
    const first = event.first ?? 0;
    const page = Math.floor(first / rows) + 1;

    this.currentPage.set(page);
    this.pageSize.set(rows);
    this.firstRecordIndex.set(first);

    this.loadFolders();
  }

  private loadFolders(): void {
    const request: GetFoldersRequest = {
      name: this.searchValue(),
      pageIndex: this.currentPage(),
      pageSize: this.pageSize(),
    };

    this.folderService.getPersonalFolders(request).subscribe();
  }

  openAddFolderModal(): void {
    this.modalService.open(AddLessonModalComponent, {
      ownerType: FolderOwnerType.Personal,
      addLessonSuccess: () => {
        this.currentPage.set(0);
      },
    });
  }

  goToFolderMaterials(folderId: string): void {
    this.router.navigate([folderId], {
      relativeTo: this.route,
      queryParams: {
        page: this.currentPage(),
        pageSize: this.pageSize(),
      },
    });
  }
}
