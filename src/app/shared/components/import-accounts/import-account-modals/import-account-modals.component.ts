import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { GlobalModalService } from '../../../services/global-modal/global-modal.service';
import { ButtonModule } from 'primeng/button';
import { MODAL_DATA } from '../../../constants/modal-data.token';

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
  readonly modalData = inject(MODAL_DATA);

  // View references
  fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');

  // State signals
  file = signal<File | null>(null);
  fileBlob = signal<Blob | null>(null);
  message = signal<string>('');
  isDragging = signal<boolean>(false);
  isValid = signal<boolean>(false);
  uploadProgress = signal<number>(0);
  isUploading = signal<boolean>(false);

  // Constants
  readonly MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  readonly ALLOWED_EXTENSIONS = ['xlsx', 'xls', 'csv'];

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

  // File management
  removeFile() {
    this.file.set(null);
    this.fileBlob.set(null);
    this.message.set('');
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

  private async handleFile(file: File) {
    this.message.set('');
    this.isValid.set(false);

    // Validate file size
    if (file.size > this.MAX_FILE_SIZE) {
      this.message.set(
        `File quá lớn. Vui lòng chọn file nhỏ hơn ${this.MAX_FILE_SIZE / (1024 * 1024)}MB`
      );
      return;
    }

    // Validate file extension
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !this.ALLOWED_EXTENSIONS.includes(fileExtension)) {
      this.message.set(
        `Vui lòng chọn file Excel (.xlsx, .xls) hoặc CSV (.csv)`
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
    } catch (error) {
      console.error('File conversion error:', error);
      this.message.set('Lỗi khi xử lý file: ' + (error as Error).message);
      this.isValid.set(false);
    }
  }

  // Upload methods
  async uploadData() {
    if (!this.fileBlob() || !this.isValid()) {
      this.message.set('Vui lòng chọn file hợp lệ trước khi tải lên');
      return;
    }
    this.isUploading.set(true);
    this.uploadProgress.set(0);

    const formData = new FormData();
    const blob = this.fileBlob()!;
    const fileName = this.file()?.name ?? 'imported_data';

    formData.append('file', blob, fileName);

    // Call API upload
  }

  closeModal() {
    this.globalModalService.close();
  }
}
