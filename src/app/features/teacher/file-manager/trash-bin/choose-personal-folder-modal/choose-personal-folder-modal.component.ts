import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
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

import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';

import { FolderManagementService } from '../../../../../shared/services/api/folder/folder-management.service';
import { LessonMaterialsService } from '../../../../../shared/services/api/lesson-materials/lesson-materials.service';
import { LoadingService } from '../../../../../shared/services/core/loading/loading.service';
import { GlobalModalService } from '../../../../../shared/services/layout/global-modal/global-modal.service';

import { MODAL_DATA } from '../../../../../shared/tokens/injection/modal-data.token';
import { FolderOwnerType } from '../../../../../shared/models/enum/folder-owner-type.enum';

import { type GetFoldersRequest } from '../../../../../shared/models/api/request/query/get-folders-request.model';

interface ChooseFolderModalData {
  materialId: string;
  onRestoreSuccess: () => void;
}

@Component({
  selector: 'app-choose-personal-folder-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SelectModule, ButtonModule],
  templateUrl: './choose-personal-folder-modal.component.html',
  styleUrl: './choose-personal-folder-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChoosePersonalFolderModalComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly folderService = inject(FolderManagementService);
  private readonly lessonMaterialService = inject(LessonMaterialsService);
  private readonly loadingService = inject(LoadingService);
  private readonly globalModalService = inject(GlobalModalService);
  private readonly modalData = inject(MODAL_DATA) as ChooseFolderModalData;

  form: FormGroup;

  readonly isLoading = this.loadingService.is('restore-material');
  readonly isLoadingFolder = this.loadingService.is('get-folders');
  readonly folderList = this.folderService.folderList;

  submitted = signal(false);

  constructor() {
    this.form = this.fb.group({
      folderId: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    const request: GetFoldersRequest = {
      ownerType: FolderOwnerType.Personal,
      sortBy: 'createdAt',
      isPaging: false,
    };
    this.folderService.getPersonalFolders(request).subscribe();
  }

  get folderId() {
    return this.form.get('folderId');
  }

  onSubmit() {
    this.submitted.set(true);

    const folderId = this.folderId?.value;
    const materialId = this.modalData.materialId;

    if (!folderId || !materialId) return;

    const request = [this.modalData.materialId];
    this.lessonMaterialService.restoreMaterial(folderId, request).subscribe({
      next: () => {
        this.modalData.onRestoreSuccess();
        this.closeModal();
      },
    });
  }

  onBlur(controlName: string) {
    this.form.get(controlName)?.markAsTouched();
  }

  closeModal() {
    this.globalModalService.close();
  }

  getErrorMessage(controlName: string): string {
    const control = this.form.get(controlName);
    if (control?.hasError('required')) {
      return 'Vui lòng chọn 1 thư mục cá nhân của bạn.';
    }
    return '';
  }
}
