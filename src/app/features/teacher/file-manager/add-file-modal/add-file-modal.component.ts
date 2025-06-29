import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

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

interface AddFileModalData {
  folderId: string;
  addFileSuccess: () => void;
}
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
  private readonly loadingService = inject(LoadingService);
  private readonly globalModalService = inject(GlobalModalService);
  private readonly toastHandlingService = inject(ToastHandlingService);
  private readonly uploadFileService = inject(UploadFileService);
  private readonly lessonMaterialsService = inject(LessonMaterialsService);
  private readonly modalData = inject(MODAL_DATA) as AddFileModalData;

  // ? Form
  // form: FormGroup;

  // ? File Size
  maxUploadFileSize = MAX_UPLOAD_FILE_SIZE;

  // ? State
  isLoading = this.loadingService.isLoading;
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

    const timestamp = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const blobNames = files.map(file => {
      const dotIndex = file.name.lastIndexOf('.');
      const base = file.name.substring(0, dotIndex);
      const ext = file.name.substring(dotIndex);
      return `${base}_${timestamp}${ext}`;
    });

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
            const request: GetLessonMaterialsRequest = {
              folderId,
            };
            return this.lessonMaterialsService.getLessonMaterials(request);
          })
        )
        .subscribe(() => {
          this.modalData.addFileSuccess();
          this.closeModal();
        });
    });
  }
}
