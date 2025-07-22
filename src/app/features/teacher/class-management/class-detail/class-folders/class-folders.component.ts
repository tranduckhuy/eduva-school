import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { ButtonModule } from 'primeng/button';

import { SubmenuDirective } from '../../../../../shared/directives/submenu/submenu.directive';

import { ClassFolderManagementService } from '../../services/class-folder-management.service';
import { FolderManagementService } from '../../../../../shared/services/api/folder/folder-management.service';
import { GlobalModalService } from '../../../../../shared/services/layout/global-modal/global-modal.service';

import { ContentType } from '../../../../../shared/models/enum/lesson-material.enum';

import { type ClassModel } from '../../../../../shared/models/entities/class.model';
import { type FolderWithMaterials } from '../class-detail.component';
import { AddClassMaterialsModalComponent } from './add-class-materials-modal/add-class-materials-modal.component';
import { RenameLessonModalComponent } from '../../../../../shared/components/rename-lesson-modal/rename-lesson-modal.component';

@Component({
  selector: 'class-folders',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule, SubmenuDirective],
  templateUrl: './class-folders.component.html',
  styleUrl: './class-folders.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClassFoldersComponent {
  private readonly classFolderService = inject(ClassFolderManagementService);
  private readonly folderService = inject(FolderManagementService);
  private readonly globalModalService = inject(GlobalModalService);

  classModel = input<ClassModel | null>();
  folderWithMaterials = input<FolderWithMaterials[]>();

  addFolderMaterials = output<void>();
  renameFolder = output<void>();
  removeFolderMaterials = output<void>();

  readonly openedMenuFolderId = signal<string | null>(null);
  readonly openedMenuMaterialKey = signal<{
    folderId: string;
    materialId: string;
  } | null>(null);

  onRenameFolder(folderId: string, folderName: string) {
    this.globalModalService.open(RenameLessonModalComponent, {
      folderId,
      folderName,
      renameLessonSuccess: () => {
        this.renameFolder.emit();
      },
    });
  }

  onRemoveFolder(folderId: string) {
    this.folderService
      .removeClassFolder(folderId)
      .subscribe(() => this.removeFolderMaterials.emit());
  }

  onRemoveMaterials(folderId: string, materialId?: string) {
    const classId = this.classModel()?.id;
    if (!classId) return;

    const request = materialId ? [materialId] : [];

    this.classFolderService
      .removeMaterialsFromClass(classId, folderId, request)
      .subscribe(() => this.removeFolderMaterials.emit());
  }

  toggleMenuFolderItem(id: string) {
    this.openedMenuFolderId.set(this.openedMenuFolderId() === id ? null : id);
  }

  toggleMenuMaterialItem(folderId: string, materialId: string) {
    const current = this.openedMenuMaterialKey();
    const isSame =
      current?.folderId === folderId && current?.materialId === materialId;

    this.openedMenuMaterialKey.set(isSame ? null : { folderId, materialId });
  }

  isMenuMaterialOpened(folderId: string, materialId: string): boolean {
    const current = this.openedMenuMaterialKey();
    return current?.folderId === folderId && current?.materialId === materialId;
  }

  openAddClassMaterialModal(folderId: string) {
    this.globalModalService.open(AddClassMaterialsModalComponent, {
      classId: this.classModel()?.id,
      targetFolderId: folderId,
      addSuccess: () => this.addFolderMaterials.emit(),
    });
  }

  getMaterialIconConfig(type: ContentType): {
    icon: string;
    textColor: string;
    bgColor: string;
  } {
    switch (type) {
      case ContentType.Video:
        return {
          icon: 'movie',
          textColor: 'text-purple',
          bgColor: 'bg-purple-100',
        };
      case ContentType.Audio:
        return {
          icon: 'volume_up',
          textColor: 'text-green-500',
          bgColor: 'bg-green-100',
        };
      case ContentType.DOCX:
        return {
          icon: 'docs',
          textColor: 'text-primary',
          bgColor: 'bg-primary-100',
        };
      case ContentType.PDF:
        return {
          icon: 'picture_as_pdf',
          textColor: 'text-orange',
          bgColor: 'bg-orange-100',
        };
      default:
        return {
          icon: 'insert_drive_file',
          textColor: 'text-gray-500',
          bgColor: 'bg-gray-100',
        };
    }
  }
}
