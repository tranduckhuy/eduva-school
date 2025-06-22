import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';

import { PrimeNG } from 'primeng/config';
import {
  FileUpload,
  FileSelectEvent,
  FileRemoveEvent,
} from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

import { GlobalModalService } from '../../../../shared/services/layout/global-modal/global-modal.service';
import { ToastHandlingService } from '../../../../shared/services/core/toast/toast-handling.service';
import { UploadFileService } from '../services/upload-file.service';
import { FileManagerService } from '../services/file-manager.service';

import {
  MAX_UPLOAD_FILE_SIZE,
  MAX_TOTAL_UPLOAD_FILE_SIZE,
  ALLOWED_UPLOAD_MIME_TYPES,
} from '../../../../shared/constants/common.constant';

import { getContentTypeFromMime } from '../../../../shared/utils/util-functions';

import { LessonMaterialRequest } from '../../../../shared/models/api/request/lesson-material-request.model';

@Component({
  selector: 'app-add-file-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TooltipModule,
    FileUpload,
    ButtonModule,
  ],
  templateUrl: './add-file-modal.component.html',
  styleUrl: './add-file-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddFileModalComponent {
  // private readonly fb = inject(FormBuilder);
  private readonly config = inject(PrimeNG);
  private readonly globalModalService = inject(GlobalModalService);
  private readonly toastHandlingService = inject(ToastHandlingService);
  private readonly uploadFileService = inject(UploadFileService);
  private readonly fileManagerService = inject(FileManagerService);

  // ? Form
  // form: FormGroup;

  // ? File Size
  maxUploadFileSize = MAX_UPLOAD_FILE_SIZE;

  // ? State
  isLoading = this.fileManagerService.isLoading;

  // ? Signal Props
  selectedFiles = signal<File[]>([]);

  // constructor() {
  //   this.form = this.fb.group({
  //     title: ['', Validators.required],
  //   });
  // }

  // get title() {
  //   return this.form.get('title')!;
  // }

  // onBlur(controlName: string) {
  //   const control = this.form.get(controlName);
  //   if (control && !control.touched) {
  //     control.markAsTouched();
  //   }
  // }

  onSelectFile(event: FileSelectEvent) {
    const currentFiles = this.selectedFiles();
    const newFiles = event.files;

    const invalidFiles = Array.from(newFiles).filter(file => {
      return !ALLOWED_UPLOAD_MIME_TYPES.some(type =>
        file.type.startsWith(type)
      );
    });

    if (invalidFiles.length > 0) {
      const fileNames = invalidFiles.map(f => f.name).join(', ');
      this.toastHandlingService.error(
        'Lỗi',
        `Các tệp không hợp lệ: ${fileNames}. Chỉ chấp nhận Video, Audio, PDF hoặc DOCX.`
      );
      return;
    }

    // ? Check new total file size if select new file
    const totalSize = [...currentFiles, ...newFiles].reduce(
      (sum, file) => sum + file.size,
      0
    );

    if (totalSize > MAX_TOTAL_UPLOAD_FILE_SIZE) {
      this.toastHandlingService.error(
        'Lỗi',
        `Tổng dung lượng không được vượt quá ${MAX_TOTAL_UPLOAD_FILE_SIZE}MB`
      );
      return;
    }

    // ? After checking then add new files to selected list
    this.selectedFiles.set([...currentFiles, ...newFiles]);
  }

  onRemoveFile(event: FileRemoveEvent) {
    const fileToRemove = event.file;
    const updated = this.selectedFiles().filter(f => f !== fileToRemove);
    this.selectedFiles.set(updated);
  }

  // onSubmit() {
  //   this.form.markAllAsTouched();

  //   const files = this.selectedFiles();
  //   const fileNames = files.map(f => f.name);

  //   const request = {
  //     blobNames: fileNames,
  //   };

  //   this.uploadFiles(request, files);
  // }

  onSubmit() {
    const files = this.selectedFiles();

    if (files.length === 0) {
      this.toastHandlingService.error(
        'Lỗi',
        'Vui lòng chọn ít nhất một tệp để tải lên.'
      );
      return;
    }

    const blobNames = files.map(file => file.name);

    this.uploadFiles(blobNames, files);
  }

  // getErrorMessage(controlName: string): string {
  //   const control = this.form.get(controlName);
  //   if (control?.hasError('required')) {
  //     return 'Trường này không được để trống';
  //   }
  //   return '';
  // }

  formatSize(bytes: number) {
    const k = 1024;
    const dm = 3;
    const sizes = this.config.translation.fileSizeTypes!;
    if (bytes === 0) {
      return `0 ${sizes[0]}`;
    }

    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const formattedSize = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));

    return `${formattedSize} ${sizes[i]}`;
  }

  closeModal() {
    this.globalModalService.close();
  }

  private uploadFiles(request: string[], files: File[]) {
    this.uploadFileService.uploadBlobs(request, files).subscribe(res => {
      if (!res) return;

      const sourceUrls = res.uploadTokens;

      const materials: LessonMaterialRequest[] = files.map((file, index) => ({
        title: file.name,
        description: '',
        tag: '',
        contentType: getContentTypeFromMime(file.type),
        duration: 0,
        fileSize: file.size,
        isAIContent: false,
        sourceUrl: sourceUrls[index],
        folderId: 0,
      }));

      this.fileManagerService.uploadLessonMaterials(materials).subscribe(() => {
        this.closeModal();
      });
    });
  }
}
