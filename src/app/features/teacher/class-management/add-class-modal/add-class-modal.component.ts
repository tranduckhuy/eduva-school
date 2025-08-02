import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

import { ButtonModule } from 'primeng/button';

import { LoadingService } from '../../../../shared/services/core/loading/loading.service';
import { GlobalModalService } from '../../../../shared/services/layout/global-modal/global-modal.service';
import { ClassManagementService } from '../services/class-management.service';
import { UploadFileService } from '../../../../shared/services/api/file/upload-file.service';

import { MODAL_DATA } from '../../../../shared/tokens/injection/modal-data.token';
import { BASE_BG_CLASS_IMAGE_URL } from '../../../../shared/constants/common.constant';

import { type CreateClassRequest } from '../models/request/command/create-class-request.model';

interface AddClassModalData {
  addClassSuccess: () => void;
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

  backgroundImageUrl = signal<string>(BASE_BG_CLASS_IMAGE_URL);

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
    this.classManagementService.createClass(request).subscribe({
      next: () => {
        this.modalData.addClassSuccess();
        this.closeModal();
      },
      error: () => {
        this.form.reset();
        this.form.patchValue({
          backgroundImageUrl: this.backgroundImageUrl(),
        });
      },
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
      this.backgroundImageUrl.set(randomUrl);
      this.form.patchValue({
        backgroundImageUrl: this.backgroundImageUrl(),
      });
    }
  }
}
