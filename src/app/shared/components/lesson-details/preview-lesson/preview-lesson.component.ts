import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  computed,
  signal,
  input,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { ImageModule } from 'primeng/image';
import { SkeletonModule } from 'primeng/skeleton';
import { DrawerModule } from 'primeng/drawer';
import { PanelModule } from 'primeng/panel';
import { AvatarModule } from 'primeng/avatar';

import { SafeHtmlPipe } from '../../../pipes/safe-html.pipe';

import { UserService } from '../../../services/api/user/user.service';
import { LessonMaterialsService } from '../../../services/api/lesson-materials/lesson-materials.service';
import { LoadingService } from '../../../services/core/loading/loading.service';
import { GlobalModalService } from '../../../../shared/services/layout/global-modal/global-modal.service';
import {
  ContentParserService,
  type RenderBlock,
} from '../../../services/layout/content-parse/content-parse.service';

import {
  clearQueryParams,
  formatRelativeDate,
} from '../../../utils/util-functions';

import { PAGE_SIZE } from '../../../constants/common.constant';
import { UserRoles } from '../../../constants/user-roles.constant';
import { LessonMaterialStatus } from '../../../models/enum/lesson-material.enum';

import { VideoViewerComponent } from '../video-viewer/video-viewer.component';
import { AudioViewerComponent } from '../audio-viewer/audio-viewer.component';
import { DocViewerComponent } from '../doc-viewer/doc-viewer.component';
import { PdfViewerComponent } from '../pdf-viewer/pdf-viewer.component';
import { PreviewLessonSkeletonComponent } from '../../skeleton/preview-lesson-skeleton/preview-lesson-skeleton.component';
import { ModerateReasonModalComponent } from '../../../../features/moderation/moderate-lessons/moderate-reason-modal/moderate-reason-modal.component';
import { CommentModalComponent } from '../../comment-components/comment-modal/comment-modal.component';

const SHOW_ACTION_BUTTON_PATHS = ['/moderation/view-lesson'];
const SHOW_COMMENT_BUTTON_PATHS = [
  '/teacher/file-manager',
  '/teacher/view-lesson',
];

@Component({
  selector: 'app-preview-lesson',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    ImageModule,
    SkeletonModule,
    DrawerModule,
    PanelModule,
    AvatarModule,
    SafeHtmlPipe,
    PdfViewerComponent,
    DocViewerComponent,
    VideoViewerComponent,
    AudioViewerComponent,
    PreviewLessonSkeletonComponent,
    CommentModalComponent,
  ],
  templateUrl: './preview-lesson.component.html',
  styleUrl: './preview-lesson.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreviewLessonComponent implements OnInit {
  // ? Injected Services
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly userService = inject(UserService);
  private readonly lessonMaterialService = inject(LessonMaterialsService);
  private readonly loadingService = inject(LoadingService);
  private readonly globalModalService = inject(GlobalModalService);
  private readonly contentParseService = inject(ContentParserService);

  // ? Inputs & Signals
  materialId = input.required<string>();

  user = this.userService.currentUser;
  isLoading = this.loadingService.isLoading;
  lessonMaterial = this.lessonMaterialService.lessonMaterial;
  lessonMaterialApproval = this.lessonMaterialService.lessonMaterialApproval;

  questionIdFromNotification = signal<string>('');

  currentUrl = signal(this.router.url);

  currentPage = signal<number>(1);
  pageSize = signal<number>(PAGE_SIZE);

  isShowingFeedback = signal<boolean>(false);
  isApprovedLesson = signal<boolean>(false);

  contentBlocks = signal<RenderBlock[]>([]);

  visible = false;

  // ? Computed Properties
  showCommentButton = computed(() => {
    const lessonMaterial = this.lessonMaterial();
    const hasShowPath = SHOW_COMMENT_BUTTON_PATHS.some(path =>
      this.currentUrl().includes(path)
    );
    return (
      hasShowPath &&
      lessonMaterial &&
      lessonMaterial.lessonStatus === LessonMaterialStatus.Approved
    );
  });

  showActionButton = computed(() =>
    SHOW_ACTION_BUTTON_PATHS.some(path => this.currentUrl().includes(path))
  );

  isSchoolAdminOrMod = computed(() => {
    const roles = this.user()?.roles || [];
    return (
      roles.includes(UserRoles.SCHOOL_ADMIN) ||
      roles.includes(UserRoles.CONTENT_MODERATOR)
    );
  });

  isTeacherOrMod = computed(() => {
    const roles = this.user()?.roles || [];
    return (
      roles.includes(UserRoles.TEACHER) ||
      roles.includes(UserRoles.CONTENT_MODERATOR)
    );
  });

  isMaterialPending = computed(
    () => this.lessonMaterial()?.lessonStatus === LessonMaterialStatus.Pending
  );

  constructor() {
    effect(
      () => {
        this.currentUrl.set(this.router.url);
      },
      { allowSignalWrites: true }
    );
  }

  ngOnInit(): void {
    this.handleRouteQueryParams();

    this.loadDetailData();
  }

  get approvalRelativeDate(): string {
    const lessonMaterialApproval = this.lessonMaterialApproval();
    if (!lessonMaterialApproval) return '';
    const approvalStatus =
      lessonMaterialApproval.statusChangeTo === LessonMaterialStatus.Approved
        ? 'Đã phê duyệt'
        : 'Đã từ chối';
    return `${approvalStatus} ${formatRelativeDate(lessonMaterialApproval.createdAt)}`;
  }

  formatUpdateDate(input?: string | null): string {
    if (!input) return 'Bài học chưa từng được cập nhật';
    const date = new Date(input);
    if (isNaN(date.getTime())) return 'Định dạng ngày không hợp lệ';
    return `Cập nhật ${formatRelativeDate(input)}`;
  }

  approveLesson() {
    this.openModerateReasonModal(true);
  }

  refuseLesson() {
    this.openModerateReasonModal(false);
  }

  private loadDetailData() {
    this.lessonMaterialService
      .getLessonMaterialById(this.materialId())
      .subscribe({
        next: () => {
          const lessonMaterial = this.lessonMaterial();
          this.contentParse(lessonMaterial?.description || '');

          const currentUser = this.user();
          if (
            lessonMaterial &&
            currentUser &&
            lessonMaterial.createdById === currentUser.id
          ) {
            this.loadApprovalData();
          }
        },
      });
  }

  private loadApprovalData() {
    this.lessonMaterialService
      .getLessonMaterialApprovalById(this.materialId())
      .subscribe({
        next: res => {
          this.isShowingFeedback.set(!!res?.[0]?.feedback);
        },
      });
  }

  private handleRouteQueryParams() {
    this.activatedRoute.queryParamMap.subscribe(params => {
      const page = Number(params.get('page'));
      const size = Number(params.get('pageSize'));
      const questionId = params.get('questionId');
      const isLinkedFromNotification = params.has('isLinkedFromNotification');

      this.currentPage.set(!isNaN(page) && page > 0 ? page : 1);
      this.pageSize.set(!isNaN(size) && size > 0 ? size : PAGE_SIZE);

      if (isLinkedFromNotification) {
        this.visible = true;
        if (questionId) {
          this.questionIdFromNotification.set(questionId);
        }
        clearQueryParams(this.router, this.activatedRoute, [
          'isLinkedFromNotification',
          'questionId',
        ]);
      }
    });
  }

  private openModerateReasonModal(isApproved: boolean) {
    this.isApprovedLesson.set(isApproved);
    this.globalModalService.open(ModerateReasonModalComponent, {
      materialId: this.materialId(),
      isApproved,
    });
  }

  private contentParse(content: string) {
    this.contentBlocks.set(
      this.contentParseService.convertHtmlToBlocks(content)
    );
  }
}
