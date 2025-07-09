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

import { ContentType } from '../../../../../shared/models/enum/lesson-material.enum';

import { type ClassModel } from '../../../../../shared/models/entities/class.model';
import { type FolderWithMaterials } from '../class-detail.component';

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

  classModel = input<ClassModel | null>();
  folderWithMaterials = input<FolderWithMaterials[]>();

  removeMaterials = output<void>();

  readonly openedMenuFolderId = signal<string | null>(null);
  readonly openedMenuMaterialId = signal<string | null>(null);

  onRemoveMaterials(folderId: string, materialId?: string) {
    const classId = this.classModel()?.id;
    if (!classId) return;

    const request = materialId ? [materialId] : undefined;

    this.classFolderService
      .removeMaterialsFromClass(classId, folderId, request)
      .subscribe(() => this.removeMaterials.emit());
  }

  toggleMenuFolderItem(id: string) {
    this.openedMenuFolderId.set(this.openedMenuFolderId() === id ? null : id);
  }

  toggleMenuMaterialItem(id: string) {
    this.openedMenuMaterialId.set(
      this.openedMenuMaterialId() === id ? null : id
    );
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
