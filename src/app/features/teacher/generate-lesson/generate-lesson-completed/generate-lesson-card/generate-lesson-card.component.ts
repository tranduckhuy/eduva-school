import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { ConfirmationService } from 'primeng/api';

import { SubmenuDirective } from '../../../../../shared/directives/submenu/submenu.directive';

import { UserService } from '../../../../../shared/services/api/user/user.service';

import { type AiJob } from '../../../../../shared/models/entities/ai-job.model';

@Component({
  selector: 'generate-lesson-card',
  standalone: true,
  imports: [DatePipe, ButtonModule, SubmenuDirective],
  templateUrl: './generate-lesson-card.component.html',
  styleUrl: './generate-lesson-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenerateLessonCardComponent {
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);
  private readonly confirmationService = inject(ConfirmationService);

  job = input.required<AiJob>();

  removeJob = output<string>();

  user = this.userService.currentUser;

  readonly openedMenuJobId = signal<string | null>(null);

  onNavigateToDetail(jobId: string) {
    this.router.navigate(['/teacher/generate-lesson/generate', jobId]);
  }

  onRemoveJob(jobId: string) {
    this.confirmationService.confirm({
      header: 'Xóa phiên tạo nội dung?',
      message:
        'Phiên tạo nội dung này sẽ bị xóa vĩnh viễn. Bạn có chắc chắn muốn tiếp tục?',
      icon: 'pi pi-info-circle',
      rejectButtonProps: {
        label: 'Không, giữ lại',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Có, xóa vĩnh viễn',
        severity: 'danger',
      },
      accept: () => {
        this.removeJob.emit(jobId);
      },
    });
  }

  toggleMenuJob(jobId: string) {
    this.openedMenuJobId.set(this.openedMenuJobId() === jobId ? null : jobId);
  }
}
