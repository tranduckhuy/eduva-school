import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';

import { ButtonModule } from 'primeng/button';

import { LoadingService } from '../../services/core/loading/loading.service';
import { GlobalModalService } from '../../services/layout/global-modal/global-modal.service';
import { FolderManagementService } from '../../services/api/folder/folder-management.service';

import { MODAL_DATA } from '../../tokens/injection/modal-data.token';

import { FolderOwnerType } from '../../models/enum/folder-owner-type.enum';

import { type CreateFolderRequest } from '../../models/api/request/command/create-folder-request.model';

interface AddLessonModalData {
  ownerType: FolderOwnerType;
  classId?: string;
  addLessonSuccess: () => void;
}

@Component({
  selector: 'app-add-lesson-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule],
  templateUrl: './add-lesson-modal.component.html',
  styleUrl: './add-lesson-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddLessonModalComponent {
  private readonly fb = inject(FormBuilder);
  private readonly loadingService = inject(LoadingService);
  private readonly globalModalService = inject(GlobalModalService);
  private readonly folderService = inject(FolderManagementService);
  private readonly modalData = inject(MODAL_DATA) as AddLessonModalData;

  readonly isLoading = this.loadingService.is('create-folder');
  readonly form: FormGroup = this.fb.group({
    name: ['', Validators.required],
  });

  get name() {
    return this.form.get('name')!;
  }

  onSubmit() {
    this.form.markAllAsTouched();

    if (this.form.invalid) return;

    const baseRequest: CreateFolderRequest = this.form.value;
    const { ownerType, classId } = this.modalData;

    if (ownerType === FolderOwnerType.Personal) {
      this.folderService.createFolder(baseRequest).subscribe({
        next: () => this.handleCreateSuccess(),
        error: () => this.resetForm(),
      });
    } else {
      const request: CreateFolderRequest = { ...baseRequest, classId };
      this.folderService.createFolder(request).subscribe({
        next: () => this.handleCreateSuccess(),
        error: () => this.resetForm(),
      });
    }
  }

  onBlur(controlName: string) {
    const control = this.form.get(controlName);
    control?.markAsTouched();
  }

  getErrorMessage(controlName: string): string {
    const control = this.form.get(controlName);
    if (control?.hasError('required')) return 'Trường này không được để trống';
    return '';
  }

  closeModal() {
    this.globalModalService.close();
  }

  private handleCreateSuccess() {
    this.modalData.addLessonSuccess();
    this.closeModal();
  }

  private resetForm() {
    this.form.reset();
    this.form.markAsUntouched();
  }
}
