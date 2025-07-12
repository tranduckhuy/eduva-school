import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
  computed,
  DestroyRef,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { SelectChangeEvent, SelectModule } from 'primeng/select';
import {
  PickListModule,
  type PickListSourceFilterEvent,
  type PickListTargetFilterEvent,
} from 'primeng/picklist';

import { FolderManagementService } from '../../../../../../shared/services/api/folder/folder-management.service';
import { LessonMaterialsService } from '../../../../../../shared/services/api/lesson-materials/lesson-materials.service';
import { ClassFolderManagementService } from '../../../services/class-folder-management.service';
import { LoadingService } from '../../../../../../shared/services/core/loading/loading.service';
import { GlobalModalService } from '../../../../../../shared/services/layout/global-modal/global-modal.service';

import { debounceSignal } from '../../../../../../shared/utils/util-functions';

import { MODAL_DATA } from '../../../../../../shared/tokens/injection/modal-data.token';
import {
  ContentType,
  LessonMaterialStatus,
} from '../../../../../../shared/models/enum/lesson-material.enum';
import { EntityStatus } from '../../../../../../shared/models/enum/entity-status.enum';

import { type Folder } from '../../../../../../shared/models/entities/folder.model';
import { type LessonMaterial } from '../../../../../../shared/models/entities/lesson-material.model';
import { type GetFoldersRequest } from '../../../../../../shared/models/api/request/query/get-folders-request.model';
import { type GetLessonMaterialsRequest } from '../../../../../../shared/models/api/request/query/get-lesson-materials-request.model';

interface AddClassMaterialModalData {
  classId: string;
  targetFolderId: string;
  addSuccess: () => void;
}

@Component({
  selector: 'app-add-class-materials-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    TooltipModule,
    SelectModule,
    PickListModule,
  ],
  templateUrl: './add-class-materials-modal.component.html',
  styleUrl: './add-class-materials-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddClassMaterialsModalComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly folderService = inject(FolderManagementService);
  private readonly lessonMaterialService = inject(LessonMaterialsService);
  private readonly classFolderService = inject(ClassFolderManagementService);
  private readonly loadingService = inject(LoadingService);
  private readonly globalModalService = inject(GlobalModalService);
  private readonly modalData = inject(MODAL_DATA) as AddClassMaterialModalData;

  readonly isLoadingAddMaterials = this.loadingService.is('add-materials');
  readonly isLoadingFolder = this.loadingService.is('get-folders');
  readonly folderList = this.folderService.folderList;

  readonly form = this.fb.group({
    folder: this.fb.control<Folder | null>(null, Validators.required),
  });

  sourceMaterials = signal<LessonMaterial[]>([]);
  targetMaterials = signal<LessonMaterial[]>([]);
  initialTargetIds = signal<Set<string>>(new Set());

  submitted = signal(false);
  sourceFilterText = signal('');
  targetFilterText = signal('');

  readonly hasNewTargetMaterials = computed(() =>
    this.targetMaterials().some(m => !this.initialTargetIds().has(m.id))
  );

  constructor() {
    this.setupFilterDebounces();
  }

  ngOnInit(): void {
    this.loadPersonalFolders();
    this.loadTargetMaterials(this.modalData.targetFolderId);
  }

  get folder() {
    return this.form.get('folder');
  }

  onBlur(controlName: string) {
    this.form.get(controlName)?.markAsTouched();
  }

  getErrorMessage(controlName: string): string {
    const control = this.form.get(controlName);
    if (control?.hasError('required')) {
      return 'Vui lòng chọn 1 thư mục cá nhân của bạn.';
    }
    return '';
  }

  onSave() {
    this.submitted.set(true);
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const materialIds = this.targetMaterials().map(m => m.id);
    this.classFolderService
      .addMaterialsForClass(
        this.modalData.classId,
        this.modalData.targetFolderId,
        materialIds
      )
      .subscribe(() => {
        this.modalData.addSuccess();
        this.closeModal();
      });
  }

  closeModal() {
    this.globalModalService.close();
  }

  handleSourceFilter(e: PickListSourceFilterEvent) {
    this.sourceFilterText.set(e.query ?? '');
  }

  handleTargetFilter(e: PickListTargetFilterEvent) {
    this.targetFilterText.set(e.query ?? '');
  }

  handleMoveToSource() {
    this.refreshMaterialSignals();
  }
  handleMoveAllToSource() {
    this.refreshMaterialSignals();
  }
  handleMoveToTarget() {
    this.refreshMaterialSignals();
  }
  handleMoveAllToTarget() {
    this.refreshMaterialSignals();
  }

  loadSourceFolderMaterials(event?: SelectChangeEvent) {
    const folder = event?.value as Folder;
    if (!folder) {
      this.sourceMaterials.set([]);
      return;
    }
    this.loadSourceMaterials(folder.id, this.sourceFilterText());
  }

  getMaterialIconConfig(type: ContentType) {
    const map: Record<
      ContentType,
      { icon: string; textColor: string; bgColor: string }
    > = {
      [ContentType.Video]: {
        icon: 'movie',
        textColor: 'text-purple',
        bgColor: 'bg-purple-100',
      },
      [ContentType.Audio]: {
        icon: 'volume_up',
        textColor: 'text-green-500',
        bgColor: 'bg-green-100',
      },
      [ContentType.DOCX]: {
        icon: 'docs',
        textColor: 'text-primary',
        bgColor: 'bg-primary-100',
      },
      [ContentType.PDF]: {
        icon: 'picture_as_pdf',
        textColor: 'text-orange',
        bgColor: 'bg-orange-100',
      },
    };

    return (
      map[type] ?? {
        icon: 'insert_drive_file',
        textColor: 'text-gray-500',
        bgColor: 'bg-gray-100',
      }
    );
  }

  private setupFilterDebounces() {
    const sourceCleanup = debounceSignal(
      this.sourceFilterText,
      () => {
        const folder = this.folder?.value;
        if (folder) {
          this.loadSourceMaterials(folder.id, this.sourceFilterText());
        }
      },
      300
    );

    const targetCleanup = debounceSignal(
      this.targetFilterText,
      () =>
        this.loadTargetMaterials(
          this.modalData.targetFolderId,
          this.targetFilterText()
        ),
      300
    );

    this.destroyRef.onDestroy(() => {
      sourceCleanup();
      targetCleanup();
    });
  }

  private refreshMaterialSignals() {
    this.targetMaterials.set([...this.targetMaterials()]);
    this.sourceMaterials.set([...this.sourceMaterials()]);
  }

  private loadPersonalFolders() {
    const request: GetFoldersRequest = {
      status: EntityStatus.Active,
      sortBy: 'createdAt',
      sortDirection: 'desc',
    };
    this.folderService.getPersonalFolders(request).subscribe();
  }

  private loadSourceMaterials(folderId: string, searchTerm: string = '') {
    const request: GetLessonMaterialsRequest = {
      sortBy: 'createdAt',
      sortDirection: 'desc',
      searchTerm,
      lessonStatus: LessonMaterialStatus.Approved,
    };

    this.lessonMaterialService
      .getLessonMaterials(folderId, request)
      .subscribe(res => {
        if (!res) return;
        const filtered = res.filter(m => !this.initialTargetIds().has(m.id));
        this.sourceMaterials.set(filtered);
      });
  }

  private loadTargetMaterials(folderId: string, searchTerm: string = '') {
    const request: GetLessonMaterialsRequest = {
      sortBy: 'createdAt',
      sortDirection: 'desc',
      searchTerm,
    };

    this.lessonMaterialService
      .getLessonMaterials(folderId, request)
      .subscribe(res => {
        if (!res) return;
        const ids = new Set(res.map(m => m.id));
        this.initialTargetIds.set(ids);
        this.targetMaterials.set([]);
      });
  }
}
