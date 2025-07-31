import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

import { SubmenuDirective } from '../../../../shared/directives/submenu/submenu.directive';

import { ClassManagementService } from '../services/class-management.service';
import { LoadingService } from '../../../../shared/services/core/loading/loading.service';
import { GlobalModalService } from '../../../../shared/services/layout/global-modal/global-modal.service';

import { PAGE_SIZE } from '../../../../shared/constants/common.constant';

import { UpdateClassModalComponent } from '../class-detail/class-information/update-class-modal/update-class-modal.component';

import { type ClassModel } from '../../../../shared/models/entities/class.model';

@Component({
  selector: 'class-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ButtonModule,
    TooltipModule,
    SubmenuDirective,
  ],
  templateUrl: './class-card.component.html',
  styleUrl: './class-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClassCardComponent {
  private readonly router = inject(Router);
  private readonly classService = inject(ClassManagementService);
  private readonly loadingService = inject(LoadingService);
  private readonly globalModalService = inject(GlobalModalService);

  classModel = input.required<ClassModel>();
  currentPage = input<number>(1);
  pageSize = input<number>(PAGE_SIZE);

  classArchived = output<void>();
  classUpdated = output<void>();

  readonly isLoadingArchive = this.loadingService.is('archive-class');

  readonly openedMenuId = signal<string>('');
  readonly isCopied = signal<boolean>(false);

  openEditClassModal() {
    this.globalModalService.open(UpdateClassModalComponent, {
      classId: this.classModel()?.id ?? '',
      name: this.classModel()?.name ?? '',
      backgroundImageUrl: this.classModel()?.backgroundImageUrl ?? '',
      updateClassSuccess: () => {
        this.classUpdated.emit();
        this.globalModalService.close();
      },
    });
  }

  onArchiveClass(classId: string) {
    this.classService.archiveClass(classId).subscribe({
      next: () => {
        this.classArchived.emit();
      },
    });
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

  toggleMenu(classId: string) {
    this.openedMenuId.set(this.openedMenuId() === classId ? '' : classId);
  }

  goToClassDetail(id: string) {
    this.router.navigate(['/teacher/class-management', id], {
      queryParams: {
        page: this.currentPage(),
        pageSize: this.pageSize(),
      },
    });
  }
}
