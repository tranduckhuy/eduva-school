import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  computed,
  signal,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { SkeletonModule } from 'primeng/skeleton';
import { ButtonModule } from 'primeng/button';

import { SafeHtmlPipe } from '../../../pipes/safe-html.pipe';

import { UserService } from '../../../services/api/user/user.service';
import { LessonMaterialsService } from '../../../services/api/lesson-materials/lesson-materials.service';
import { LoadingService } from '../../../services/core/loading/loading.service';
import { GlobalModalService } from '../../../../shared/services/layout/global-modal/global-modal.service';

import { UserRoles } from '../../../constants/user-roles.constant';
import { PAGE_SIZE } from '../../../constants/common.constant';

import { VideoViewerComponent } from '../video-viewer/video-viewer.component';
import { AudioViewerComponent } from '../audio-viewer/audio-viewer.component';
import { DocViewerComponent } from '../doc-viewer/doc-viewer.component';
import { PdfViewerComponent } from '../pdf-viewer/pdf-viewer.component';
import { PreviewLessonSkeletonComponent } from '../../skeleton/preview-lesson-skeleton/preview-lesson-skeleton.component';
import { ModerateReasonModalComponent } from '../../../../features/school-admin/moderate-lessons/moderate-reason-modal/moderate-reason-modal.component';

@Component({
  selector: 'app-preview-lesson',
  standalone: true,
  imports: [
    CommonModule,
    SkeletonModule,
    ButtonModule,
    SafeHtmlPipe,
    PdfViewerComponent,
    DocViewerComponent,
    VideoViewerComponent,
    AudioViewerComponent,
    PreviewLessonSkeletonComponent,
  ],
  templateUrl: './preview-lesson.component.html',
  styleUrl: './preview-lesson.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreviewLessonComponent implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly userService = inject(UserService);
  private readonly lessonMaterialService = inject(LessonMaterialsService);
  private readonly loadingService = inject(LoadingService);
  private readonly globalModalService = inject(GlobalModalService);

  materialId = input.required<string>();

  user = this.userService.currentUser;
  lessonMaterial = this.lessonMaterialService.lessonMaterial;
  isLoading = this.loadingService.isLoading;

  isSchoolAdminOrMod = computed(
    () =>
      this.user()?.roles.includes(UserRoles.SCHOOL_ADMIN) ||
      this.user()?.roles.includes(UserRoles.CONTENT_MODERATOR)
  );

  currentPage = signal<number>(1);
  pageSize = signal<number>(PAGE_SIZE);
  isApprovedLesson = signal(false);

  ngOnInit(): void {
    this.activatedRoute.queryParamMap.subscribe(params => {
      const page = Number(params.get('page'));
      const size = Number(params.get('pageSize'));

      this.currentPage.set(!isNaN(page) && page > 0 ? page : 1);
      this.pageSize.set(!isNaN(size) && size > 0 ? size : PAGE_SIZE);
    });

    this.lessonMaterialService
      .getLessonMaterialById(this.materialId())
      .subscribe();
  }

  formatUpdateDate(input?: string | null): string {
    if (!input) return 'Bài học chưa từng được cập nhật';

    const date = new Date(input);
    if (isNaN(date.getTime())) return 'Định dạng ngày không hợp lệ';

    return `Cập nhật tháng ${date.getUTCMonth() + 1} năm ${date.getUTCFullYear()}`;
  }

  openModerateReasonModal(isApproved: boolean) {
    this.isApprovedLesson.set(isApproved);
    this.globalModalService.open(ModerateReasonModalComponent, {
      materialId: this.materialId(),
      isApproved,
    });
  }

  approveLesson() {
    this.openModerateReasonModal(true);
  }

  refuseLesson() {
    this.openModerateReasonModal(false);
  }
}
