import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';

import { FolderManagementService } from '../../../services/api/folder/folder-management.service';
import { ClassFolderManagementService } from '../../../../features/teacher/class-management/services/class-folder-management.service';
import { LoadingService } from '../../../services/core/loading/loading.service';
import { GlobalModalService } from '../../../services/layout/global-modal/global-modal.service';
import { ClassManagementService } from '../../../../features/teacher/class-management/services/class-management.service';
import { EntityStatus } from '../../../models/enum/entity-status.enum';
import { GetTeacherClassRequest } from '../../../../features/teacher/class-management/models/request/query/get-teacher-class-request.model';
import { UserService } from '../../../services/api/user/user.service';
import { MODAL_DATA } from '../../../tokens/injection/modal-data.token';

@Component({
  selector: 'app-share-class-material-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    TooltipModule,
    SelectModule,
  ],
  templateUrl: './share-class-material-modal.component.html',
  styleUrl: './share-class-material-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShareClassMaterialModalComponent {
  private readonly fb = inject(FormBuilder);
  private readonly folderService = inject(FolderManagementService);
  private readonly classFolderService = inject(ClassFolderManagementService);
  private readonly loadingService = inject(LoadingService);
  private readonly globalModalService = inject(GlobalModalService);
  private readonly classService = inject(ClassManagementService);
  private readonly userService = inject(UserService);
  readonly modalData = inject(MODAL_DATA);

  readonly isLoadingAddMaterials = this.loadingService.is('add-materials');
  readonly isLoadingFolder = this.loadingService.is('get-folders');
  readonly isLoadingClasses = this.loadingService.is('get-teacher-classes');
  readonly folderList = this.folderService.folderList;
  readonly currentUser = this.userService.currentUser;
  readonly classes = this.classService.classes;

  form: FormGroup;

  submitted = signal(false);

  constructor() {
    this.form = this.fb.group({
      class: [null, Validators.required],
      folder: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadPersonalClasses();
  }

  onSave() {
    this.submitted.set(true);
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.classFolderService
      .addMaterialsForClass(this.class?.value, this.folder?.value, [
        this.modalData.materialId,
      ])
      .subscribe(() => {
        this.closeModal();
      });
  }

  get folder() {
    return this.form.get('folder');
  }

  get class() {
    return this.form.get('class');
  }

  getErrorMessage(controlName: string): string {
    const control = this.form.get(controlName);
    if (control?.hasError('required')) {
      if (controlName === 'class') {
        return 'Vui lòng chọn một lớp học.';
      } else if (controlName === 'folder' && !this.class?.value) {
        return 'Vui lòng chọn lớp học trước';
      } else if (controlName === 'folder') {
        return 'Vui lòng chọn một thư mục.';
      }
    }
    return '';
  }

  closeModal() {
    this.globalModalService.close();
  }

  loadClassFolders(classId: string) {
    this.folderService.getClassFolders(classId).subscribe();
  }

  private loadPersonalClasses() {
    const request: GetTeacherClassRequest = {
      teacherId: this.currentUser()?.id,
      status: EntityStatus.Active,
      sortBy: 'createdAt',
      sortDirection: 'desc',
      isPagingEnabled: false,
    };
    this.classService.getClasses(request).subscribe();
  }
}
