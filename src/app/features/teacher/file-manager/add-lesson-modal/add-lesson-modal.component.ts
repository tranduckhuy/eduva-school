import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';

import { ButtonModule } from 'primeng/button';

import { LoadingService } from '../../../../shared/services/core/loading/loading.service';
import { GlobalModalService } from '../../../../shared/services/layout/global-modal/global-modal.service';
import { FolderManagementService } from '../../../../shared/services/api/folder/folder-management.service';

import { MODAL_DATA } from '../../../../shared/tokens/injection/modal-data.token';

import { type CreateFolderRequest } from '../../../../shared/models/api/request/command/create-folder-request.model';
import { switchMap } from 'rxjs';
import { GetFoldersRequest } from '../../../../shared/models/api/request/query/get-folders-request.model';
import { PAGE_SIZE } from '../../../../shared/constants/common.constant';

interface AddLessModalData {
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
  private readonly folderManagementService = inject(FolderManagementService);
  private readonly modalData = inject(MODAL_DATA) as AddLessModalData;

  form: FormGroup;

  isLoading = this.loadingService.is('create-folder');

  constructor() {
    this.form = this.fb.group({
      name: ['', Validators.required],
    });
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

    const request: CreateFolderRequest = this.form.value;
    this.folderManagementService
      .createFolder(request)
      .pipe(
        switchMap(() => {
          const request: GetFoldersRequest = {
            pageIndex: 1,
            pageSize: PAGE_SIZE,
          };
          return this.folderManagementService.getPersonalFolders(request);
        })
      )
      .subscribe(() => {
        this.modalData.addLessonSuccess();
        this.closeModal();
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
}
