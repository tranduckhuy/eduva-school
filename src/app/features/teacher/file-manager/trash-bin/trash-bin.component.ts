import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  signal,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { catchError, forkJoin, of } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { TableModule, type TableLazyLoadEvent } from 'primeng/table';
import { ConfirmationService } from 'primeng/api';

import { BytesToReadablePipe } from '../../../../shared/pipes/byte-to-readable.pipe';

import { GlobalModalService } from '../../../../shared/services/layout/global-modal/global-modal.service';
import { FolderManagementService } from '../../../../shared/services/api/folder/folder-management.service';
import { LessonMaterialsService } from '../../../../shared/services/api/lesson-materials/lesson-materials.service';

import { PAGE_SIZE } from '../../../../shared/constants/common.constant';
import { EntityStatus } from '../../../../shared/models/enum/entity-status.enum';
import { ContentType } from '../../../../shared/models/enum/lesson-material.enum';
import { FolderOwnerType } from '../../../../shared/models/enum/folder-owner-type.enum';

import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { SearchInputComponent } from '../../../../shared/components/search-input/search-input.component';
import { TableSkeletonComponent } from '../../../../shared/components/skeleton/table-skeleton/table-skeleton.component';
import { TableEmptyStateComponent } from '../../../../shared/components/table-empty-state/table-empty-state.component';
import { ChoosePersonalFolderModalComponent } from './choose-personal-folder-modal/choose-personal-folder-modal.component';

import { type Folder } from '../../../../shared/models/entities/folder.model';
import { type LessonMaterial } from '../../../../shared/models/entities/lesson-material.model';
import { type GetFoldersRequest } from '../../../../shared/models/api/request/query/get-folders-request.model';
import { type GetPersonalLessonMaterialsRequest } from '../../../../shared/models/api/request/query/get-lesson-materials-request.model';
import { type DeleteMaterialRequest } from '../../../../shared/models/api/request/command/delete-material-request.model';

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
    BytesToReadablePipe,
    SearchInputComponent,
    ButtonComponent,
    TableSkeletonComponent,
    TableEmptyStateComponent,
  ],
  templateUrl: './trash-bin.component.html',
  styleUrl: './trash-bin.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrashBinComponent {
  private readonly confirmationService = inject(ConfirmationService);
  private readonly globalModalService = inject(GlobalModalService);
  private readonly folderService = inject(FolderManagementService);
  private readonly lessonMaterialService = inject(LessonMaterialsService);

  isLoading = input<boolean>(false);
  shouldStopRequest = signal<boolean>(false);

  trashItems = signal<TrashItem[]>([]);
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

  onLazyLoad(event: TableLazyLoadEvent): void {
    const rows = event.rows ?? this.pageSize();
    const first = event.first ?? 0;
    const page = Math.floor(first / rows) + 1;

    this.currentPage.set(page);
    this.pageSize.set(rows);
    this.firstRecordIndex.set(first);
    this.shouldStopRequest.set(false);

    this.loadTrashItems();
  }

  onSearch(searchTerm?: string): void {
    this.searchValue.set(searchTerm ?? '');
    this.currentPage.set(1);
    this.firstRecordIndex.set(0);
    this.shouldStopRequest.set(false);

    this.loadTrashItems();
  }

  onRestoreItem(type: 'folder' | 'material', id: string) {
    if (type === 'folder') {
      this.folderService.restoreFolder(id).subscribe({
        next: () => this.loadTrashItems(),
      });
    } else {
      this.globalModalService.open(ChoosePersonalFolderModalComponent, {
        materialId: id,
        onRestoreSuccess: () => {
          this.loadTrashItems();
        },
      });
    }
  }

  onDeleteItem(type: 'folder' | 'material', id: string): void {
    const isFolder = type === 'folder';

    this.confirmDelete({
      header: isFolder ? 'Xóa thư mục?' : 'Xóa tài liệu?',
      message: isFolder
        ? 'Thư mục này sẽ bị xóa vĩnh viễn. Bạn có chắc chắn muốn tiếp tục?'
        : 'Tài liệu này sẽ bị xóa vĩnh viễn. Bạn có chắc chắn muốn tiếp tục?',
      accept: () => {
        if (isFolder) {
          this.handleDeleteFolder([id]);
        } else {
          this.handleDeleteMaterial([id]);
        }
      },
    });
  }

  onDeleteAllItem(): void {
    const currentTrashItems = this.trashItems();

    const folderIds = currentTrashItems
      .filter(item => item.type === 'folder')
      .map(item => item.data.id);

    const materialIds = currentTrashItems
      .filter(item => item.type === 'material')
      .map(item => item.data.id);

    if (folderIds.length === 0 && materialIds.length === 0) return;

    this.confirmDelete({
      header: 'Xóa toàn bộ mục trong thùng rác?',
      message:
        'Toàn bộ mục trong thùng rác sẽ bị xóa vĩnh viễn. Bạn có chắc chắn muốn tiếp tục?',
      accept: () => {
        const deleteFolder$ = folderIds.length
          ? this.folderService
              .removeFolder(folderIds)
              .pipe(catchError(() => of(null)))
          : of(null);

        const deleteMaterial$ = materialIds.length
          ? this.lessonMaterialService
              .deleteMaterial({ ids: materialIds, permanent: true })
              .pipe(catchError(() => of(null)))
          : of(null);

        forkJoin([deleteFolder$, deleteMaterial$]).subscribe({
          next: () => this.loadTrashItems(),
        });
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

  private loadTrashItems(): void {
    if (this.shouldStopRequest()) return;

    const pageSize = this.pageSize() * 2;

    const folderRequest: GetFoldersRequest = {
      status: EntityStatus.Archived,
      ownerType: FolderOwnerType.Personal,
      pageIndex: 1,
      pageSize,
      sortBy: 'lastModifiedAt',
      searchTerm: this.searchValue(),
      isPaging: true,
    };

    const materialRequest: GetPersonalLessonMaterialsRequest = {
      entityStatus: EntityStatus.Deleted,
      pageIndex: 1,
      pageSize,
      sortBy: 'lastModifiedAt',
      searchTerm: this.searchValue(),
      isPagingEnabled: true,
    };

    forkJoin([
      this.folderService.getPersonalFolders(folderRequest),
      this.lessonMaterialService.getPersonalLessonMaterials(materialRequest),
    ]).subscribe({
      next: ([folders, materials]) => {
        const sortedFolders = (folders ?? []).sort((a, b) => {
          const dateA = a.lastModifiedAt ?? '';
          const dateB = b.lastModifiedAt ?? '';
          return new Date(dateB).getTime() - new Date(dateA).getTime();
        });

        const sortedMaterials = (materials ?? []).sort((a, b) => {
          const dateA = a.lastModifiedAt ?? '';
          const dateB = b.lastModifiedAt ?? '';
          return new Date(dateB).getTime() - new Date(dateA).getTime();
        });

        const merged: TrashItem[] = [
          ...sortedFolders.map(f => ({ type: 'folder', data: f }) as const),
          ...sortedMaterials.map(m => ({ type: 'material', data: m }) as const),
        ];

        const total = sortedFolders.length + sortedMaterials.length;
        const start = this.firstRecordIndex();
        const end = start + this.pageSize();

        this.totalRecords.set(total);
        this.trashItems.set(merged.slice(start, end));
      },
      error: () => this.shouldStopRequest.set(true),
    });
  }

  private handleDeleteFolder(ids: string[]): void {
    this.folderService.removeFolder(ids).subscribe({
      next: () => this.loadTrashItems(),
    });
  }

  private handleDeleteMaterial(ids: string[]): void {
    const request: DeleteMaterialRequest = {
      ids,
      permanent: true,
    };

    this.lessonMaterialService.deleteMaterial(request).subscribe({
      next: () => this.loadTrashItems(),
    });
  }

  private confirmDelete({
    header,
    message,
    accept,
  }: {
    header: string;
    message: string;
    accept: () => void;
  }): void {
    this.confirmationService.confirm({
      header,
      message,
      icon: 'pi pi-info-circle',
      rejectButtonProps: {
        label: 'Không, giữ lại',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Có, xóa vĩnh viễn',
        severity: 'danger',
      },
      accept,
    });
  }
}
