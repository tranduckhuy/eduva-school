import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';

import { ButtonModule } from 'primeng/button';

import { GlobalModalService } from '../../../services/layout/global-modal/global-modal.service';
import { ToastHandlingService } from '../../../services/core/toast/toast-handling.service';
import { ImportUserAccountsService } from '../services/import-user-accounts.service';
import { DownloadTemplateService } from '../services/download-template.service';

import { MODAL_DATA } from '../../../services/layout/global-modal/modal-data.token';
import {
  MAX_IMPORT_FILE_SIZE,
  ALLOWED_IMPORT_EXTENSIONS,
} from '../../../constants/common.constant';

@Component({
  selector: 'app-import-account-modals',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './import-account-modals.component.html',
  styleUrl: './import-account-modals.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportAccountModalsComponent {
  private readonly globalModalService = inject(GlobalModalService);
  private readonly toastHandlingService = inject(ToastHandlingService);
  private readonly importUserAccountsService = inject(
    ImportUserAccountsService
  );
  private readonly downloadTemplateService = inject(DownloadTemplateService);

  readonly modalData = inject(MODAL_DATA);

  isLoadingTemplate = this.downloadTemplateService.isLoading;
  isLoadingUpload = this.importUserAccountsService.isLoading;

  // View references
  fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');

  // State signals
  file = signal<File | null>(null);
  fileBlob = signal<Blob | null>(null);
  isDragging = signal<boolean>(false);
  isValid = signal<boolean>(false);
  uploadProgress = signal<number>(0);
  isUploading = signal<boolean>(false);

  // Drag and drop handlers
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    const files = event.dataTransfer?.files;
    if (files?.length) {
      this.handleFile(files[0]);
    }
  }

  closeModal() {
    this.globalModalService.close();
  }

  // File management
  removeFile() {
    this.file.set(null);
    this.fileBlob.set(null);
    this.isValid.set(false);
    this.uploadProgress.set(0);
    if (this.fileInput()) {
      this.fileInput().nativeElement.value = '';
    }
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    await this.handleFile(file);
  }

  // Upload methods
  async uploadData() {
    if (!this.fileBlob() || !this.isValid()) {
      this.toastHandlingService.info(
        'Thông tin',
        'Vui lòng chọn file hợp lệ trước khi tải lên'
      );
      return;
    }
    this.isUploading.set(true);
    this.uploadProgress.set(0);

    const formData = new FormData();
    const blob = this.fileBlob()!;
    const fileName = this.file()?.name ?? 'imported_data';

    formData.append('file', blob, fileName);

    // Call API upload
    this.importUserAccountsService.importUserAccountsJson(formData).subscribe({
      next: () => {
        this.closeModal();
      },
    });
  }

  downloadTemplate() {
    this.downloadTemplateService.downloadTemplate().subscribe();
  }

  private async handleFile(file: File) {
    this.isValid.set(false);

    // Validate file size
    if (file.size > MAX_IMPORT_FILE_SIZE) {
      this.toastHandlingService.error(
        'Lỗi',
        `File quá lớn. Vui lòng chọn file nhỏ hơn ${MAX_IMPORT_FILE_SIZE / (1024 * 1024)}MB`
      );
      return;
    }

    // Validate file extension
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !ALLOWED_IMPORT_EXTENSIONS.includes(fileExtension)) {
      this.toastHandlingService.info(
        'Thông tin',
        'Vui lòng chọn file Excel (.xlsx, .xls) hoặc CSV (.csv)'
      );
      return;
    }

    this.file.set(file);
    await this.convertFileToBlob(file);
    this.isValid.set(true);
  }

  private async convertFileToBlob(file: File): Promise<void> {
    try {
      let blob: Blob;
      blob = new Blob([file], { type: file.type });
      this.fileBlob.set(blob);
    } catch {
      this.toastHandlingService.errorGeneral();
      this.isValid.set(false);
    }
  }
}
