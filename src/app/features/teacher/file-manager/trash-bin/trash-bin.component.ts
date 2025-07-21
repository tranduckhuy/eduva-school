import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { TableModule, type TableLazyLoadEvent } from 'primeng/table';
import { ConfirmationService } from 'primeng/api';

import { BytesToReadablePipe } from '../../../../shared/pipes/byte-to-readable.pipe';

import { FolderManagementService } from '../../../../shared/services/api/folder/folder-management.service';
import { LessonMaterialsService } from '../../../../shared/services/api/lesson-materials/lesson-materials.service';

import { PAGE_SIZE } from '../../../../shared/constants/common.constant';
import { EntityStatus } from '../../../../shared/models/enum/entity-status.enum';
import { FolderOwnerType } from '../../../../shared/models/enum/folder-owner-type.enum';
import { ContentType } from '../../../../shared/models/enum/lesson-material.enum';

import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { SearchInputComponent } from '../../../../shared/components/search-input/search-input.component';
import { TableSkeletonComponent } from '../../../../shared/components/skeleton/table-skeleton/table-skeleton.component';
import { TableEmptyStateComponent } from '../../../../shared/components/table-empty-state/table-empty-state.component';

import { type Folder } from '../../../../shared/models/entities/folder.model';
import { type LessonMaterial } from '../../../../shared/models/entities/lesson-material.model';
import { type GetFoldersRequest } from '../../../../shared/models/api/request/query/get-folders-request.model';
import { type GetPersonalLessonMaterialsRequest } from '../../../../shared/models/api/request/query/get-lesson-materials-request.model';

type TrashItem =
  | { type: 'folder'; data: Folder }
  | { type: 'material'; data: LessonMaterial };

@Component({
  selector: 'app-trash-bin',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    ButtonModule,
    TooltipModule,
    TableModule,
    SearchInputComponent,
    ButtonComponent,
    TableSkeletonComponent,
    TableEmptyStateComponent,
    BytesToReadablePipe,
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
  shouldStopRequest = signal<boolean>(false);

  items = signal<TrashItem[]>([]);
  totalRecords = signal<number>(0);

  currentPage = signal(1);
  pageSize = signal(PAGE_SIZE);
  firstRecordIndex = signal(0);
  searchValue = signal('');

  tableHeadSkeleton = signal([
    'Tên thư mục/tài liệu',
    'Người sở hữu',
    'Ngày chuyển vào thùng rác',
    'Kích thước tệp',
    'Hành động',
  ]);

  constructor() {
    effect(
      () => {
        if (this.shouldStopRequest()) return;

        const folders = this.folderService.folderList();
        const materials = this.lessonMaterialService.lessonMaterials();

        const merged: TrashItem[] = [
          ...folders.map(f => ({ type: 'folder', data: f }) as const),
          ...materials.map(m => ({ type: 'material', data: m }) as const),
        ];

        this.items.set(merged);
      },
      { allowSignalWrites: true }
    );

    effect(
      () => {
        if (this.shouldStopRequest()) return;

        const folderCount = this.folderService.totalRecords();
        const materialCount = this.lessonMaterialService.totalRecords();
        this.totalRecords.set(folderCount + materialCount);
      },
      { allowSignalWrites: true }
    );
  }

  ngOnInit(): void {
    this.shouldStopRequest.set(false);

    this.loadAllData();
  }

  onLazyLoad(event: TableLazyLoadEvent): void {
    const rows = event.rows ?? this.pageSize();
    const first = event.first ?? 0;
    const page = Math.floor(first / rows) + 1;

    this.currentPage.set(page);
    this.pageSize.set(rows);
    this.firstRecordIndex.set(first);
    this.shouldStopRequest.set(false);

    this.loadAllData();
  }

  onSearch(searchTerm?: string): void {
    this.searchValue.set(searchTerm ?? '');
    this.currentPage.set(1);
    this.firstRecordIndex.set(0);
    this.shouldStopRequest.set(false);

    this.loadAllData();
  }

  onDeleteItem(type: string, id: string) {}

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

  private loadFolder() {
    const request: GetFoldersRequest = {
      status: EntityStatus.Archived,
      ownerType: FolderOwnerType.Personal,
      pageIndex: this.currentPage(),
      pageSize: this.pageSize(),
      sortBy: 'lastModifiedAt',
      searchTerm: this.searchValue(),
      isPaging: true,
    };
    this.folderService.getPersonalFolders(request).subscribe({
      error: () => this.shouldStopRequest.set(true),
    });
  }

  private loadMaterial() {
    const request: GetPersonalLessonMaterialsRequest = {
      entityStatus: EntityStatus.Deleted,
      pageIndex: this.currentPage(),
      pageSize: this.pageSize(),
      sortBy: 'lastModifiedAt',
      searchTerm: this.searchValue(),
      isPagingEnabled: true,
    };
    this.lessonMaterialService.getPersonalLessonMaterials(request).subscribe({
      error: () => this.shouldStopRequest.set(true),
    });
  }

  private loadAllData(): void {
    this.loadFolder();
    this.loadMaterial();
  }
}
