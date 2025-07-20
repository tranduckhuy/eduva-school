import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';

import { ButtonModule } from 'primeng/button';

import { LoadingService } from '../../services/core/loading/loading.service';
import { GlobalModalService } from '../../services/layout/global-modal/global-modal.service';
import { FolderManagementService } from '../../services/api/folder/folder-management.service';

import { MODAL_DATA } from '../../tokens/injection/modal-data.token';
import { RenameFolderRequest } from '../../models/api/request/command/rename-material-request.model';

interface RenameLessonModalData {
  folderId: string;
  folderName: string;
  renameLessonSuccess: () => void;
}

@Component({
  selector: 'app-rename-lesson-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule],
  templateUrl: './rename-lesson-modal.component.html',
  styleUrl: './rename-lesson-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RenameLessonModalComponent {
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly loadingService = inject(LoadingService);
  private readonly globalModalService = inject(GlobalModalService);
  private readonly folderService = inject(FolderManagementService);
  private readonly modalData = inject(MODAL_DATA) as RenameLessonModalData;

  readonly isLoading = this.loadingService.is('rename-folder');

  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      name: [
        this.modalData.folderName ? this.modalData.folderName : '',
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

  onSubmit() {
    this.form.markAllAsTouched();

    if (this.form.invalid) return;

    const request: RenameFolderRequest = this.form.value;
    this.folderService
      .renameFolder(this.modalData.folderId, request)
      .subscribe({
        next: () => this.handleRenameSuccess(),
        error: () => this.resetForm(),
      });
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

  private handleRenameSuccess() {
    this.modalData.renameLessonSuccess();
    this.closeModal();
  }

  private resetForm() {
    this.form.reset();
    this.form.markAsUntouched();
  }
}
