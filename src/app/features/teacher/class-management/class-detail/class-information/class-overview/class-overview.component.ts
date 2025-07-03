import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { ButtonModule } from 'primeng/button';
import { AccordionModule } from 'primeng/accordion';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ConfirmationService } from 'primeng/api';

import { ClassManagementService } from '../../../services/class-management.service';
import { GlobalModalService } from '../../../../../../shared/services/layout/global-modal/global-modal.service';

import { ContentType } from '../../../../../../shared/models/enum/lesson-material.enum';

import { AddLessonModalComponent } from '../../../../../../shared/components/add-lesson-modal/add-lesson-modal.component';

import { type ClassModel } from '../../../../../../shared/models/entities/class.model';
import { type FolderWithMaterials } from '../../class-detail.component';
import { FolderOwnerType } from '../../../../../../shared/models/enum/folder-owner-type.enum';

@Component({
  selector: 'class-overview',
  standalone: true,
  imports: [CommonModule, ButtonModule, AccordionModule, ConfirmPopupModule],
  templateUrl: './class-overview.component.html',
  styleUrl: './class-overview.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClassOverviewComponent {
  private readonly classManagementService = inject(ClassManagementService);
  private readonly globalModalService = inject(GlobalModalService);
  private readonly confirmationService = inject(ConfirmationService);

  classModel = input<ClassModel | null>();
  folderWithMaterials = input<FolderWithMaterials[]>();
  folderCount = input<number>(0);
  materialCount = input<number>(0);

  classFolderAdded = output();

  isCopied = signal<boolean>(false);
  accordionActiveIndex = signal<number>(0);

  confirmRefresh(event: Event) {
    this.confirmationService.confirm({
      key: 'popup',
      target: event.target as EventTarget,
      message: 'Bạn có muốn làm mới mã lớp không?',
      rejectButtonProps: {
        label: 'Không',
        size: 'small',
        severity: 'secondary',
        styleClass: 'h-[30px]',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Có',
        size: 'small',
        severity: 'info',
        styleClass: 'h-[30px]',
        outlined: true,
      },
      reject: () => {
        return;
      },
      accept: () => this.acceptRefreshClassCode(),
    });
  }

  acceptRefreshClassCode() {
    const classModel = this.classModel();

    if (!classModel) return;

    this.classManagementService.refreshClassCode(classModel.id).subscribe();
  }

  copyClassCode() {
    if (this.isCopied()) return;

    const classCode = this.classModel()?.classCode;
    if (!classCode) return;

    navigator.clipboard.writeText(classCode).then(() => {
      this.isCopied.set(true);

      setTimeout(() => {
        this.isCopied.set(false);
      }, 5000);
    });
  }

  openAddFolderModal(): void {
    this.globalModalService.open(AddLessonModalComponent, {
      ownerType: FolderOwnerType.Class,
      classId: this.classModel()?.id,
      addLessonSuccess: () => {
        this.classFolderAdded.emit();
      },
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
