import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { finalize, switchMap, throwError } from 'rxjs';

import {
  FileUpload,
  FileSelectEvent,
  FileRemoveEvent,
} from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

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

import { type FileStorageRequest } from '../../../../shared/models/api/request/command/file-storage-request.model';
import {
  type CreateLessonMaterialRequest,
  type CreateLessonMaterialsRequest,
} from '../../../../shared/models/api/request/command/create-lesson-material-request.model';
import { FileStorageService } from '../services/file-storage.service';
import { ContentType } from '../../../../shared/models/enum/lesson-material.enum';

type FileMetadata = {
  blobName: string;
  duration: number;
  file: File;
};

@Component({
  selector: 'app-add-file-modal',
  standalone: true,
  imports: [CommonModule, TooltipModule, FileUpload, ButtonModule],
  templateUrl: './add-file-modal.component.html',
  styleUrl: './add-file-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddFileModalComponent {
  private readonly globalModalService = inject(GlobalModalService);
  private readonly toastHandlingService = inject(ToastHandlingService);
  private readonly userService = inject(UserService);
  private readonly uploadFileService = inject(UploadFileService);
  private readonly fileStorageService = inject(FileStorageService);
  private readonly lessonMaterialsService = inject(LessonMaterialsService);
  private readonly modalData = inject(MODAL_DATA);

  maxUploadFileSize = MAX_UPLOAD_FILE_SIZE;

  user = this.userService.currentUser;

  isLoading = signal(false);
  selectedFiles = signal<File[]>([]);

  onSelectFile(event: FileSelectEvent) {
    const currentFiles = this.selectedFiles();
    const newFiles = event.files;

    const validFiles: File[] = [];
    const invalidTypeFiles: File[] = [];
    const oversizedFiles: File[] = [];

    // ? Separate files by validity (type and size)
    for (const file of newFiles) {
      const isValidType = ALLOWED_UPLOAD_MIME_TYPES.some(type =>
        file.type.startsWith(type)
      );

      if (!isValidType) {
        invalidTypeFiles.push(file);
        continue;
      }

      if (file.size > MAX_UPLOAD_FILE_SIZE) {
        oversizedFiles.push(file);
        continue;
      }

      const isDuplicate = currentFiles.some(
        f => f.name === file.name && f.size === file.size
      );

      if (!isDuplicate) {
        validFiles.push(file);
      }
    }

    // ? Warn invalid type files
    if (invalidTypeFiles.length > 0) {
      const fileNames = invalidTypeFiles.map(f => f.name).join(', ');
      this.toastHandlingService.warn(
        'Cảnh báo',
        `Các tệp không hợp lệ về định dạng và đã bị bỏ qua: ${fileNames}.`
      );
    }

    // ? Warn oversized files
    if (oversizedFiles.length > 0) {
      const fileNames = oversizedFiles.map(f => f.name).join(', ');
      this.toastHandlingService.warn(
        'Cảnh báo',
        `Các tệp vượt quá dung lượng tối đa ${(MAX_UPLOAD_FILE_SIZE / 1024 / 1024).toFixed(0)}MB và đã bị bỏ qua: ${fileNames}.`
      );
    }

    if (validFiles.length === 0) return;

    const totalSize = [...currentFiles, ...validFiles].reduce(
      (sum, file) => sum + file.size,
      0
    );

    if (totalSize > MAX_TOTAL_UPLOAD_FILE_SIZE) {
      this.toastHandlingService.error(
        'Lỗi',
        `Tổng dung lượng tệp không được vượt quá ${(MAX_TOTAL_UPLOAD_FILE_SIZE / 1024 / 1024).toFixed(0)}MB.`
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

  onClearFiles(clearCallback: () => void) {
    clearCallback();
    this.selectedFiles.set([]);
  }

  async onSubmit() {
    const files = this.selectedFiles();

    if (files.length === 0) {
      this.toastHandlingService.error(
        'Lỗi',
        'Vui lòng chọn ít nhất một tệp để tải lên.'
      );
      return;
    }

    const timestamp = Date.now();
    const schoolId = this.user()?.school?.id ?? 0;
    this.isLoading.set(true);
    const fileMetadata = await this.buildFileMetadata(
      files,
      timestamp,
      schoolId
    );

    const fileStorageRequest: FileStorageRequest = {
      files: fileMetadata.map(m => ({
        blobName: m.blobName,
        fileSize: m.file.size,
      })),
    };

    this.uploadFiles(fileStorageRequest, fileMetadata, this.modalData.folderId);
  }

  formatSize(bytes: number): string {
    const k = 1000;
    const dm = 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    if (bytes === 0) return `0 ${sizes[0]}`;

    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const formattedSize = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));

    return `${formattedSize} ${sizes[i]}`;
  }

  closeModal() {
    this.globalModalService.close();
  }

  private uploadFiles(
    request: FileStorageRequest,
    fileMetadata: FileMetadata[],
    folderId: string
  ) {
    if (!request?.files?.length || !fileMetadata.length) return;

    const files = fileMetadata.map(f => f.file);

    this.isLoading.set(true);

    this.uploadFileService
      .uploadBlobs(request, files)
      .pipe(
        switchMap(res => {
          if (!res) return throwError(() => new Error());

          const materials: CreateLessonMaterialRequest[] = fileMetadata.map(
            ({ file, duration }, index) => ({
              title: file.name,
              description: '',
              contentType: getContentTypeFromMime(file.type),
              duration: Math.round(duration),
              fileSize: file.size,
              isAIContent: false,
              sourceUrl: res.uploadTokens[index],
            })
          );

          const createRequest: CreateLessonMaterialsRequest = {
            folderId,
            blobNames: fileMetadata.map(m => m.blobName),
            lessonMaterials: materials,
          };

          return this.lessonMaterialsService.createLessonMaterials(
            createRequest
          );
        }),
        switchMap(() =>
          this.lessonMaterialsService.getLessonMaterialsByFolder(folderId)
        ),
        switchMap(() => this.fileStorageService.getFileStorageQuota()),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: () => {
          this.closeModal();
        },
        error: () => {
          this.toastHandlingService.errorGeneral();
        },
      });
  }

  private async buildFileMetadata(
    files: File[],
    timestamp: number,
    schoolId: number
  ): Promise<FileMetadata[]> {
    const metadataPromises = files.map(async file => {
      const dotIndex = file.name.lastIndexOf('.');
      const base = file.name.substring(0, dotIndex);
      const ext = file.name.substring(dotIndex);
      const blobName = `${base}_${timestamp}_${schoolId}${ext}`;

      const contentType = getContentTypeFromMime(file.type);

      let duration = 60;
      if (
        contentType === ContentType.Audio ||
        contentType === ContentType.Video
      ) {
        duration = await this.getMediaDuration(file);
      }

      return { blobName, file, duration };
    });

    return Promise.all(metadataPromises);
  }

  private getMediaDuration(file: File): Promise<number> {
    return new Promise(resolve => {
      const url = URL.createObjectURL(file);
      const media = document.createElement(
        file.type.startsWith('audio/') ? 'audio' : 'video'
      );

      media.preload = 'metadata';
      media.src = url;

      media.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        resolve(media.duration);
      };

      media.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(0);
      };
    });
  }
}
