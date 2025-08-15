import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TooltipModule } from 'primeng/tooltip';
import { CheckboxModule } from 'primeng/checkbox';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { SubmenuDirective } from '../../../../../shared/directives/submenu/submenu.directive';

import { GlobalModalService } from '../../../../../shared/services/layout/global-modal/global-modal.service';
import { AiJobsService } from '../services/api/ai-jobs.service';
import {
  ResourcesStateService,
  type SourceItem,
} from '../services/utils/resources-state.service';

import { UploadResourcesModalComponent } from './upload-resources-modal/upload-resources-modal.component';

@Component({
  selector: 'generate-lesson-upload',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TooltipModule,
    CheckboxModule,
    ProgressSpinnerModule,
    SubmenuDirective,
  ],
  templateUrl: './generate-lesson-upload.component.html',
  styleUrl: './generate-lesson-upload.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenerateLessonUploadComponent implements OnInit {
  private readonly modalService = inject(GlobalModalService);
  private readonly resourcesStateService = inject(ResourcesStateService);
  private readonly aiJobService = inject(AiJobsService);

  readonly selectAll = this.resourcesStateService.selectAll;
  readonly openedMenuId = this.resourcesStateService.openedMenuId;

  readonly job = this.aiJobService.job;

  readonly isLoading = this.resourcesStateService.isLoading;
  readonly hasGeneratedSuccessfully =
    this.resourcesStateService.hasGeneratedSuccessfully;
  readonly hasPreviewContentSuccessfully =
    this.resourcesStateService.hasPreviewContentSuccessfully;
  readonly sourceList = this.resourcesStateService.sourceList;
  readonly currentCount = this.resourcesStateService.totalSources;
  readonly totalFileSize = this.resourcesStateService.totalFileSize;
  readonly maxCount = this.resourcesStateService.maxFileCount;
  readonly maxFileSize = this.resourcesStateService.maxFileSize;

  readonly isFileCountLimitReached = computed(
    () => this.currentCount() >= this.maxCount
  );
  readonly isFileSizeLimitReached = computed(
    () => this.totalFileSize() >= this.maxFileSize
  );
  readonly isAnyLimitReached = computed(
    () => this.isFileCountLimitReached() || this.isFileSizeLimitReached()
  );

  disableUploadButton = computed(
    () =>
      this.isLoading() ||
      this.isAnyLimitReached() ||
      this.hasPreviewContentSuccessfully() ||
      this.hasGeneratedSuccessfully()
  );

  disableCheckboxAll = computed(() => {
    const sourceList = this.sourceList();
    const hasUploading = sourceList.some(item => item.isUploading);

    return (
      hasUploading ||
      this.isLoading() ||
      this.hasPreviewContentSuccessfully() ||
      this.hasGeneratedSuccessfully() ||
      this.sourceList().length <= 0
    );
  });

  disableCheckboxItem = computed(() => {
    const list = this.sourceList();
    const loading = this.isLoading();
    const generated = this.hasGeneratedSuccessfully();
    const preview = this.hasPreviewContentSuccessfully();

    const result: Record<string, boolean> = {};

    for (const item of list) {
      result[item.id] = item.isUploading || loading || preview || generated;
    }

    return result;
  });

  ngOnInit(): void {
    const job = this.job();

    if (!job) return;

    this.resourcesStateService.markGeneratedSuccess();
  }

  toggleAll(checked: boolean) {
    this.resourcesStateService.setSelectAll(checked);
    this.resourcesStateService.updateSourceList(items =>
      items.map(item => (item.isUploading ? item : { ...item, checked }))
    );
  }

  toggleItem(id: string, checked: boolean) {
    const items = this.sourceList();
    const target = items.find(item => item.id === id);
    if (target?.isUploading) return;
    this.resourcesStateService.updateSourceList(items =>
      items.map(item => (item.id === id ? { ...item, checked } : item))
    );

    const allChecked = this.sourceList()
      .filter(i => !i.isUploading)
      .every(i => i.checked);

    this.resourcesStateService.setSelectAll(allChecked);
  }

  removeItem(id: string) {
    this.resourcesStateService.updateSourceList(items =>
      items.filter(item => item.id !== id)
    );

    const current = this.sourceList();
    const allChecked = current
      .filter(i => !i.isUploading)
      .every(i => i.checked);
    this.resourcesStateService.setSelectAll(allChecked);
  }

  toggleMenu(id: string) {
    this.resourcesStateService.setOpenedMenuId(
      this.openedMenuId() === id ? null : id
    );
  }

  openUploadModal() {
    if (this.isAnyLimitReached()) return;

    const handleUploadedFile = (file: File) => {
      const fileExt = file.name.split('.').pop()?.toLowerCase() ?? 'docx';
      const fileType = fileExt === 'pdf' ? 'pdf' : 'docx';

      const newItem: SourceItem = {
        id: Date.now().toString(),
        name: file.name,
        checked: true,
        type: fileType,
        isUploading: true,
        file,
      };

      this.resourcesStateService.updateSourceList(list => [...list, newItem]);

      this.markFileAsUploadedAfterDelay(newItem.id);

      const allChecked = this.sourceList()
        .filter(i => !i.isUploading)
        .every(i => i.checked);

      this.resourcesStateService.setSelectAll(allChecked);
    };

    this.modalService.open(UploadResourcesModalComponent, {
      onUploaded: handleUploadedFile,
      current: this.currentCount(),
      max: this.maxCount,
      currentSize: this.totalFileSize(),
      maxSize: this.maxFileSize,
    });
  }

  formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  private markFileAsUploadedAfterDelay(fileId: string) {
    setTimeout(() => {
      this.resourcesStateService.updateSourceList(list =>
        list.map(item =>
          item.id === fileId ? { ...item, isUploading: false } : item
        )
      );
    }, 2000);
  }
}
