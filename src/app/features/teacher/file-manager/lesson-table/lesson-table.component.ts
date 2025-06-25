import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';

import { TooltipModule } from 'primeng/tooltip';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';

import { type Folder } from '../../../../shared/models/entities/folder.model';

import { PAGE_SIZE } from '../../../../shared/constants/common.constant';

import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { FolderManagementService } from '../../../../shared/services/api/folder/folder-management.service';
import { GetFoldersRequest } from '../../../../shared/models/api/request/get-folders-request.model';

@Component({
  selector: 'lesson-table',
  standalone: true,
  imports: [DatePipe, TooltipModule, TableModule, ButtonComponent],
  templateUrl: './lesson-table.component.html',
  styleUrl: './lesson-table.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LessonTableComponent {
  private readonly folderManagementService = inject(FolderManagementService);

  searchValue = input<string>();

  viewMaterials = output<Folder>();

  loading = signal<boolean>(false);
  first = signal<number>(0);
  rows = signal<number>(0);

  lessons = this.folderManagementService.folderList;
  totalRecords = this.folderManagementService.totalRecords;

  get maxRowsByPage() {
    return PAGE_SIZE;
  }

  loadDataLazy(event: TableLazyLoadEvent) {
    const rows = event.rows ?? this.maxRowsByPage;
    const first = event.first ?? 0;
    const page = first / rows;
    const request: GetFoldersRequest = {
      name: this.searchValue() ?? '',
      pageIndex: page + 1,
      pageSize: this.maxRowsByPage,
    };
    this.folderManagementService.getPersonalFolders(request).subscribe(() => {
      this.loading.set(false);
    });
  }

  onSearchTriggered(term: string) {}

  next() {
    this.first.set(this.first() + this.rows());
  }

  prev() {
    this.first.set(this.first() - this.rows());
  }

  pageChange(event: any) {
    this.first.set(event.first);
    this.rows.set(event.rows);
  }

  isLastPage(): boolean {
    return this.lessons()
      ? this.first() + this.rows() >= this.lessons().length
      : true;
  }

  isFirstPage(): boolean {
    return this.lessons() ? this.first() === 0 : true;
  }
}
