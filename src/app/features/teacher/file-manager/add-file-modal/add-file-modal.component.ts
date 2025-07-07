import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { switchMap } from 'rxjs';

import { PrimeNG } from 'primeng/config';
import {
  FileUpload,
  FileSelectEvent,
  FileRemoveEvent,
} from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

import { LoadingService } from '../../../../shared/services/core/loading/loading.service';
import { GlobalModalService } from '../../../../shared/services/layout/global-modal/global-modal.service';
import { ToastHandlingService } from '../../../../shared/services/core/toast/toast-handling.service';
import { UserService } from '../../../../shared/services/api/user/user.service';
import { UploadFileService } from '../../../../shared/services/api/file/upload-file.service';
import { LessonMaterialsService } from '../../../../shared/services/api/lesson-materials/lesson-materials.service';

import { MODAL_DATA } from '../../../../shared/tokens/injection/modal-data.token';

import {
  MAX_UPLOAD_FILE_SIZE,
  MAX_TOTAL_UPLOAD_FILE_SIZE,
  ALLOWED_UPLOAD_MIME_TYPES,
} from '../../../../shared/constants/common.constant';

import { getContentTypeFromMime } from '../../../../shared/utils/util-functions';

import {
  CreateLessonMaterialRequest,
  CreateLessonMaterialsRequest,
} from '../../../../shared/models/api/request/command/create-lesson-material-request.model';
import { type GetLessonMaterialsRequest } from '../../../../shared/models/api/request/query/get-lesson-materials-request.model';

@Component({
  selector: 'app-add-file-modal',
  standalone: true,
  imports: [CommonModule, TooltipModule, FileUpload, ButtonModule],
  templateUrl: './add-file-modal.component.html',
  styleUrl: './add-file-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddFileModalComponent {
  private readonly config = inject(PrimeNG);
  private readonly loadingService = inject(LoadingService);
  private readonly globalModalService = inject(GlobalModalService);
  private readonly toastHandlingService = inject(ToastHandlingService);
  private readonly userService = inject(UserService);
  private readonly uploadFileService = inject(UploadFileService);
  private readonly lessonMaterialsService = inject(LessonMaterialsService);
  private readonly modalData = inject(MODAL_DATA);

  maxUploadFileSize = MAX_UPLOAD_FILE_SIZE;

  user = this.userService.currentUser;
  isLoading = this.loadingService.isLoading;

  selectedFiles = signal<File[]>([]);

  onSelectFile(event: FileSelectEvent) {
    const currentFiles = this.selectedFiles();
    const newFiles = event.files;

    const validFiles: File[] = [];
    const invalidFiles: File[] = [];

    // ? Separate valid and invalid files based on allowed MIME types
    for (const file of newFiles) {
      const isValidType = ALLOWED_UPLOAD_MIME_TYPES.some(type =>
        file.type.startsWith(type)
      );

      if (isValidType) {
        validFiles.push(file);
      } else {
        invalidFiles.push(file);
      }
    }

    // ? Warn user about invalid files but allow valid ones to proceed
    if (invalidFiles.length > 0) {
      const fileNames = invalidFiles.map(f => f.name).join(', ');
      this.toastHandlingService.warn(
        'Warning',
        `The following files are invalid and have been skipped: ${fileNames}.`
      );
    }

    // ? If no valid files remain, do nothing
    if (validFiles.length === 0) {
      return;
    }

    // ? Check if total size (existing + new valid files) exceeds limit
    const totalSize = [...currentFiles, ...validFiles].reduce(
      (sum, file) => sum + file.size,
      0
    );

    if (totalSize > MAX_TOTAL_UPLOAD_FILE_SIZE) {
      this.toastHandlingService.error(
        'Error',
        `Total file size must not exceed ${(MAX_TOTAL_UPLOAD_FILE_SIZE / 1024 / 1024).toFixed(0)}MB.`
      );
      return;
    }

    // ? All checks passed, update selected file list with valid files
    this.selectedFiles.set([...currentFiles, ...validFiles]);
  }

  onRemoveFile(event: FileRemoveEvent) {
    const fileToRemove = event.file;
    const updated = this.selectedFiles().filter(f => f !== fileToRemove);
    this.selectedFiles.set(updated);
  }

  onSubmit() {
    const files = this.selectedFiles();

    if (files.length === 0) {
      this.toastHandlingService.error(
        'Lỗi',
        'Vui lòng chọn ít nhất một tệp để tải lên.'
      );
      return;
    }

    // ? Unique blob name with SchoolId
    const timestamp = Date.now();
    const schoolId = this.user()?.school ? this.user()?.school?.id : '';
    const blobNames = files.map(file => {
      const dotIndex = file.name.lastIndexOf('.');
      const base = file.name.substring(0, dotIndex);
      const ext = file.name.substring(dotIndex);
      return `${base}_${timestamp}_${schoolId}${ext}`;
    });

    this.uploadFiles(blobNames, files);
  }

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

  private uploadFiles(blobNames: string[], files: File[]) {
    if (!files?.length || !blobNames?.length) return;

    this.uploadFileService.uploadBlobs(blobNames, files).subscribe(res => {
      if (!res) return;

      const folderId = this.modalData.folderId;
      const sourceUrls = res.uploadTokens;
      const materials: CreateLessonMaterialRequest[] = files.map(
        (file, index) => ({
          title: file.name,
          description: '',
          tag: '',
          contentType: getContentTypeFromMime(file.type),
          duration: 0,
          fileSize: file.size,
          isAIContent: false,
          sourceUrl: sourceUrls[index],
        })
      );

      const request: CreateLessonMaterialsRequest = {
        folderId,
        blobNames,
        lessonMaterials: materials,
      };
      this.lessonMaterialsService
        .createLessonMaterials(request)
        .pipe(
          switchMap(() => {
            return this.lessonMaterialsService.getLessonMaterials(folderId);
          })
        )
        .subscribe(() => {
          this.closeModal();
        });
    });
  }
}
