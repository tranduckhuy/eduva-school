import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TooltipModule } from 'primeng/tooltip';
import { CheckboxModule } from 'primeng/checkbox';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { SubmenuDirective } from '../../../../../shared/directives/submenu/submenu.directive';

import { GlobalModalService } from '../../../../../shared/services/layout/global-modal/global-modal.service';
import { ResourcesStateService } from '../services/utils/resources-state.service';

import { UploadResourcesModalComponent } from './upload-resources-modal/upload-resources-modal.component';

interface SourceItem {
  id: string;
  name: string;
  checked: boolean;
  isUploading?: boolean;
  type: 'pdf' | 'txt';
  file?: File;
}

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
export class GenerateLessonUploadComponent {
  private readonly modalService = inject(GlobalModalService);
  private readonly resourcesStateService = inject(ResourcesStateService);

  readonly selectAll = signal(false);
  readonly openedMenuId = signal<string | null>(null);

  readonly sourceList = this.resourcesStateService.sourceList;
  readonly currentCount = this.resourcesStateService.totalSources;
  readonly maxCount = 5;

  toggleAll(checked: boolean) {
    this.selectAll.set(checked);
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

    this.selectAll.set(allChecked);
  }

  removeItem(id: string) {
    this.resourcesStateService.updateSourceList(items =>
      items.filter(item => item.id !== id)
    );

    const current = this.sourceList();
    const allChecked = current
      .filter(i => !i.isUploading)
      .every(i => i.checked);
    this.selectAll.set(allChecked);
  }

  toggleMenu(id: string) {
    this.openedMenuId.set(this.openedMenuId() === id ? null : id);
  }

  openUploadModal() {
    if (this.currentCount() >= this.maxCount) return;

    const handleUploadedFile = (file: File) => {
      const isAllChecked = this.selectAll();
      const fileExt = file.name.split('.').pop()?.toLowerCase() ?? 'txt';
      const fileType = fileExt === 'pdf' ? 'pdf' : 'txt';

      const newItem: SourceItem = {
        id: Date.now().toString(),
        name: file.name,
        checked: isAllChecked,
        type: fileType,
        isUploading: true,
        file,
      };

      this.resourcesStateService.updateSourceList(list => [...list, newItem]);

      this.markFileAsUploadedAfterDelay(newItem.id);
    };

    this.modalService.open(UploadResourcesModalComponent, {
      onUploaded: handleUploadedFile,
      current: this.currentCount(),
      max: this.maxCount,
    });
  }

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
