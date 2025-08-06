import {
  ChangeDetectionStrategy,
  Component,
  inject,
  output,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { FileSelectEvent, FileUpload } from 'primeng/fileupload';
import { ProgressBar } from 'primeng/progressbar';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

import { GlobalModalService } from '../../../../../../shared/services/layout/global-modal/global-modal.service';
import { ToastHandlingService } from '../../../../../../shared/services/core/toast/toast-handling.service';

import { ALLOWED_UPLOAD_GENERATE_MIME_TYPES } from '../../../../../../shared/constants/common.constant';

type UploadModalData = {
  onUploaded: (file: File) => void;
  current: number;
  max: number;
  currentSize: number;
  maxSize: number;
};

@Component({
  selector: 'upload-resources-modal',
  standalone: true,
  imports: [CommonModule, FileUpload, ProgressBar, ButtonModule, TooltipModule],
  templateUrl: './upload-resources-modal.component.html',
  styleUrl: './upload-resources-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadResourcesModalComponent {
  private readonly modalService = inject(GlobalModalService);
  private readonly toastHandlingService = inject(ToastHandlingService);

  fileUploaded = output<{ fileName: string; lastModified: number }>();

  readonly progressValue = computed(() => {
    const countProgress = (this.current / this.max) * 100;
    const sizeProgress = (this.currentSize / this.maxSize) * 100;
    return Math.max(countProgress, sizeProgress);
  });

  readonly progressTooltip = computed(() => {
    const countText = `${this.current} / ${this.max} tài liệu`;
    const sizeText = `${this.formatFileSize(this.currentSize)} / ${this.formatFileSize(this.maxSize)}`;

    if (this.current >= this.max) {
      return `Đã đạt giới hạn số lượng: ${countText}`;
    }
    if (this.currentSize >= this.maxSize) {
      return `Đã đạt giới hạn dung lượng: ${sizeText}`;
    }

    return `${countText} | ${sizeText}`;
  });

  readonly isUploadDisabled = computed(() => {
    return this.current >= this.max || this.currentSize >= this.maxSize;
  });

  readonly dynamicMaxFileSize = computed(() => {
    const remainingSize = this.maxSize - this.currentSize;
    return Math.max(0, remainingSize);
  });

  get modalData(): UploadModalData {
    return this.modalService.data() as UploadModalData;
  }

  get current(): number {
    return this.modalData.current;
  }

  get max(): number {
    return this.modalData.max;
  }

  get currentSize(): number {
    return this.modalData.currentSize;
  }

  get maxSize(): number {
    return this.modalData.maxSize;
  }

  formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  onSelectFile(event: FileSelectEvent) {
    const file = event.files?.[0];
    if (file) {
      const isValidType = ALLOWED_UPLOAD_GENERATE_MIME_TYPES.some(type =>
        file.type.startsWith(type)
      );

      if (!isValidType) {
        this.toastHandlingService.warn(
          'Cảnh báo',
          'Tệp bạn tải lên không hợp lệ về định dạng.'
        );
        return;
      }

      // Validate file size
      if (this.currentSize + file.size > this.maxSize) {
        this.toastHandlingService.warn(
          'Cảnh báo',
          'Tổng dung lượng tệp vượt quá giới hạn cho phép (10MB).'
        );
        return;
      }

      // Validate file count
      if (this.current >= this.max) {
        this.toastHandlingService.warn(
          'Cảnh báo',
          'Đã đạt số lượng tối đa tệp (5 tệp).'
        );
        return;
      }

      this.modalData.onUploaded?.(file);
      this.closeModal();
    }
  }

  closeModal() {
    this.modalService.close();
  }
}
