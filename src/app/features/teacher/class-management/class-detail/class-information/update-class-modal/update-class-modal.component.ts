import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';

import { ButtonModule } from 'primeng/button';

import { ClassManagementService } from '../../../services/class-management.service';
import { LoadingService } from '../../../../../../shared/services/core/loading/loading.service';
import { GlobalModalService } from '../../../../../../shared/services/layout/global-modal/global-modal.service';

import { MODAL_DATA } from '../../../../../../shared/tokens/injection/modal-data.token';

import { ChooseImageModalComponent } from '../choose-image-modal/choose-image-modal.component';

import { type CreateClassRequest } from '../../../models/request/command/create-class-request.model';

interface UpdateClassModalData {
  classId: string;
  name: string;
  backgroundImageUrl: string;
  updateClassSuccess: () => void;
}

@Component({
  selector: 'app-update-class-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule],
  templateUrl: './update-class-modal.component.html',
  styleUrl: './update-class-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpdateClassModalComponent {
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly classService = inject(ClassManagementService);
  private readonly loadingService = inject(LoadingService);
  private readonly globalModalService = inject(GlobalModalService);
  readonly modalData = inject(MODAL_DATA) as UpdateClassModalData;

  readonly isLoading = this.loadingService.is('update-class-information');

  submitted = signal(false);

  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      name: [
        this.modalData.name ? this.modalData.name : '',
        [Validators.required],
      ],
      backgroundImageUrl: [
        this.modalData.backgroundImageUrl
          ? this.modalData.backgroundImageUrl
          : '',
        [Validators.required],
      ],
    });

    this.form.statusChanges.subscribe(() => {
      this.cdr.markForCheck();
    });
  }

  get name() {
    return this.form.get('name')!;
  }

  get backgroundImageUrl() {
    return this.form.get('backgroundImageUrl')!;
  }

  onBlur(controlName: string) {
    this.form.get(controlName)?.markAsTouched();
  }

  getErrorMessage(controlName: string): string {
    const control = this.form.get(controlName);
    if (control?.hasError('required')) {
      return 'Trường này không được để trống';
    }
    return '';
  }

  openChooseImageModal() {
    this.globalModalService.open(ChooseImageModalComponent, {
      currentImageUrl:
        this.backgroundImageUrl.value ?? this.modalData.backgroundImageUrl,
      onImageSelected: (selectedImageUrl: string) => {
        this.backgroundImageUrl.setValue(selectedImageUrl);
        this.cdr.markForCheck();
      },
      onModalClosed: () => {
        this.globalModalService.open(UpdateClassModalComponent, {
          classId: this.modalData.classId,
          name: this.name.value,
          backgroundImageUrl: this.backgroundImageUrl.value,
          updateClassSuccess: this.modalData.updateClassSuccess,
        });
      },
    });
  }

  onSave() {
    this.submitted.set(true);
    this.form.markAllAsTouched();

    if (this.form.invalid) return;

    const request: CreateClassRequest = this.form.value;
    this.classService.updateClass(this.modalData.classId, request).subscribe({
      next: () => this.modalData.updateClassSuccess(),
    });
  }

  closeModal() {
    this.globalModalService.close();
  }
}
