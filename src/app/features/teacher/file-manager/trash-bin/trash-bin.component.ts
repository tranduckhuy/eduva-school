import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';

import { TooltipModule } from 'primeng/tooltip';
import { TableModule, type TableLazyLoadEvent } from 'primeng/table';
import { ConfirmationService } from 'primeng/api';

import { FolderManagementService } from '../../../../shared/services/api/folder/folder-management.service';
import { LessonMaterialsService } from '../../../../shared/services/api/lesson-materials/lesson-materials.service';

import { PAGE_SIZE } from '../../../../shared/constants/common.constant';
import { FolderOwnerType } from '../../../../shared/models/enum/folder-owner-type.enum';
import { EntityStatus } from '../../../../shared/models/enum/entity-status.enum';

import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { SearchInputComponent } from '../../../../shared/components/search-input/search-input.component';
import { TableSkeletonComponent } from '../../../../shared/components/skeleton/table-skeleton/table-skeleton.component';
import { TableEmptyStateComponent } from '../../../../shared/components/table-empty-state/table-empty-state.component';
import { GetFoldersRequest } from '../../../../shared/models/api/request/query/get-folders-request.model';

@Component({
  selector: 'app-trash-bin',
  standalone: true,
  imports: [
    DatePipe,
    TooltipModule,
    TableModule,
    SearchInputComponent,
    ButtonComponent,
    TableSkeletonComponent,
    TableEmptyStateComponent,
  ],
  templateUrl: './trash-bin.component.html',
  styleUrl: './trash-bin.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrashBinComponent implements OnInit {
  private readonly confirmationService = inject(ConfirmationService);
  private readonly folderService = inject(FolderManagementService);
  private readonly lessonMaterialService = inject(LessonMaterialsService);

  isLoading = input<boolean>(false);

  currentPage = signal(1);
  pageSize = signal(PAGE_SIZE);
  firstRecordIndex = signal(0);
  searchValue = signal('');
  items = signal([]);
  totalRecords = signal<number>(0);

  tableHeadSkeleton = signal([
    'Tên thư mục/tài liệu',
    'Người sở hữu',
    'Ngày chuyển vào thùng rác',
    'Kích thước tệp',
    'Hành động',
  ]);

  ngOnInit(): void {}

  onSearch(searchTerm?: string) {}

  onLazyLoad(event: TableLazyLoadEvent): void {
    const rows = event.rows ?? this.pageSize();
    const first = event.first ?? 0;
    const page = Math.floor(first / rows) + 1;

    this.currentPage.set(page);
    this.pageSize.set(rows);
    this.firstRecordIndex.set(first);
  }

  onDeleteItem(id: string) {}

  private loadFolder() {
    const request: GetFoldersRequest = {
      sortBy: 'lastModifiedAt',
      ownerType: FolderOwnerType.Personal,
      status: EntityStatus.Archived,
    };
    this.folderService.getPersonalFolders(request).subscribe();
  }

  private loadMaterial() {}
}
