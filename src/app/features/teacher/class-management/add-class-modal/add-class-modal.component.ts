import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

import { switchMap } from 'rxjs';

import { ButtonModule } from 'primeng/button';

import { LoadingService } from '../../../../shared/services/core/loading/loading.service';
import { GlobalModalService } from '../../../../shared/services/layout/global-modal/global-modal.service';
import { ClassManagementService } from '../services/class-management.service';
import { UploadFileService } from '../../../../shared/services/api/file/upload-file.service';

import { BASE_BG_CLASS_IMAGE_URL } from '../../../../shared/constants/common.constant';

import { MODAL_DATA } from '../../../../shared/tokens/injection/modal-data.token';

import { type CreateClassRequest } from '../models/request/command/create-class-request.model';
import { type GetTeacherClassRequest } from '../models/request/query/get-teacher-class-request.model';

interface AddClassModalData {
  pageIndex: number;
  pageSize: number;
}

@Component({
  selector: 'app-add-class-modal',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, ButtonModule],
  templateUrl: './add-class-modal.component.html',
  styleUrl: './add-class-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddClassModalComponent {
  private readonly fb = inject(FormBuilder);
  private readonly loadingService = inject(LoadingService);
  private readonly globalModalService = inject(GlobalModalService);
  private readonly classManagementService = inject(ClassManagementService);
  private readonly uploadFileService = inject(UploadFileService);
  private readonly modalData = inject(MODAL_DATA) as AddClassModalData;

  form: FormGroup;

  isLoading = this.loadingService.isLoading;

  constructor() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      backgroundImageUrl: [''],
    });
  }

  ngOnInit() {
    this.setRandomBackground();
  }

  get name() {
    return this.form.get('name')!;
  }

  onBlur(controlName: string) {
    const control = this.form.get(controlName);
    if (control && !control.touched) {
      control.markAsTouched();
    }
  }

  onSubmit() {
    this.form.markAllAsTouched();

    if (this.form.invalid) return;

    const request: CreateClassRequest = this.form.value;
    this.classManagementService
      .createClassAsTeacher(request)
      .pipe(
        switchMap(() => {
          const request: GetTeacherClassRequest = {
            pageIndex: this.modalData.pageIndex,
            pageSize: this.modalData.pageSize,
          };
          return this.classManagementService.getTeacherClasses(request);
        })
      )
      .subscribe({
        next: () => this.closeModal(),
        error: () => this.form.reset(),
      });
  }

  getErrorMessage(controlName: string): string {
    const control = this.form.get(controlName);
    if (control?.hasError('required')) {
      return 'Trường này không được để trống';
    }
    return '';
  }

  closeModal() {
    this.globalModalService.close();
  }

  private async setRandomBackground() {
    const urls = await this.uploadFileService.getBackgroundImageUrls();
    if (urls.length > 0) {
      const randomUrl = urls[Math.floor(Math.random() * urls.length)];
      this.form.patchValue({
        backgroundImageUrl: randomUrl ?? BASE_BG_CLASS_IMAGE_URL,
      });
    }
  }
}
