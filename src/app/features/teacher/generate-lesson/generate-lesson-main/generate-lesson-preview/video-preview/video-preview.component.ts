import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  effect,
  inject,
} from '@angular/core';

import { finalize, switchMap } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinner } from 'primeng/progressspinner';
import { ConfirmationService } from 'primeng/api';

import { ResourcesStateService } from '../../services/utils/resources-state.service';
import { GenerateSettingsSelectionService } from '../../services/utils/generate-settings-selection.service';
import { ToastHandlingService } from '../../../../../../shared/services/core/toast/toast-handling.service';
import { UserService } from '../../../../../../shared/services/api/user/user.service';
import { AiJobsService } from '../../services/api/ai-jobs.service';
import { AiSocketService } from '../../services/api/ai-socket.service';
import { LessonMaterialsService } from '../../../../../../shared/services/api/lesson-materials/lesson-materials.service';

import { LessonGenerationType } from '../../../../../../shared/models/enum/lesson-generation-type.enum';
import { JobStatus } from '../../../../../../shared/models/enum/job-status.enum';
import { ContentType } from '../../../../../../shared/models/enum/lesson-material.enum';

import { VideoPreviewPlayerComponent } from './video-preview-player/video-preview-player.component';

import { type AiJob } from '../../../../../../shared/models/entities/ai-job.model';
import { type ConfirmCreateContent } from '../../models/request/command/confirm-create-content-request.model';
import {
  type CreateLessonMaterialRequest,
  type CreateLessonMaterialsRequest,
} from '../../../../../../shared/models/api/request/command/create-lesson-material-request.model';

@Component({
  selector: 'generated-video-preview',
  standalone: true,
  imports: [
    ButtonModule,
    TooltipModule,
    ProgressSpinner,
    VideoPreviewPlayerComponent,
  ],
  templateUrl: './video-preview.component.html',
  styleUrl: './video-preview.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoPreviewComponent implements OnInit {
  private readonly resourcesStateService = inject(ResourcesStateService);
  private readonly generateSettingsService = inject(
    GenerateSettingsSelectionService
  );
  private readonly toastHandlingService = inject(ToastHandlingService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly userService = inject(UserService);
  private readonly aiJobService = inject(AiJobsService);
  private readonly aiSocketService = inject(AiSocketService);
  private readonly lessonMaterialService = inject(LessonMaterialsService);

  user = this.userService.currentUser;

  job = this.aiJobService.job;
  jobId = this.aiJobService.jobId;
  generationType = this.aiJobService.generationType;

  jobUpdateProgress = this.aiSocketService.jobUpdateProgress;

  isLoading = this.resourcesStateService.isLoading;
  hasInteracted = this.resourcesStateService.hasInteracted;
  totalCheckedSources = this.resourcesStateService.totalCheckedSources;
  aiGeneratedMetadataMap = this.resourcesStateService.aiGeneratedMetadataMap;
  hasGeneratedSuccessfully =
    this.resourcesStateService.hasGeneratedSuccessfully;
  hasPreviewContentSuccessfully =
    this.resourcesStateService.hasPreviewContentSuccessfully;

  speedRate = this.generateSettingsService.selectedRate;
  voice = this.generateSettingsService.selectedVoice;
  language = this.generateSettingsService.selectedLanguage;
  folderId = this.generateSettingsService.selectedFolderId;

  videoUrl = this.resourcesStateService.videoUrl;
  videoState = this.resourcesStateService.videoState;

  currentGeneratedType = this.resourcesStateService.currentGeneratedType;

  readonly disableGenerate = computed(() => {
    const uploading = this.resourcesStateService
      .sourceList()
      .some(x => x.isUploading);

    return (
      uploading ||
      this.isLoading() ||
      this.hasGeneratedSuccessfully() ||
      !this.hasPreviewContentSuccessfully() ||
      (this.totalCheckedSources() === 0 && !this.hasInteracted())
    );
  });

  readonly isSubscriptionExpired = computed(() => {
    const user = this.user();
    if (!user?.userSubscriptionResponse) return true;

    const { isSubscriptionActive, subscriptionEndDate } =
      user.userSubscriptionResponse;

    if (!isSubscriptionActive) return true;

    const currentDate = new Date();
    const endDate = new Date(subscriptionEndDate);

    return endDate < currentDate;
  });

  constructor() {
    effect(
      () => {
        const generationType = this.generationType();
        const payload = this.jobUpdateProgress();
        const jobStatus = payload?.status;
        const failureReason = payload?.failureReason;

        if (
          payload &&
          !failureReason &&
          jobStatus === JobStatus.Completed &&
          generationType === LessonGenerationType.Video &&
          this.videoState() !== 'generated'
        ) {
          this.resourcesStateService.setVideoUrl(
            payload.videoOutputBlobNameUrl
          );
          this.resourcesStateService.setVideoState('generated');

          this.resourcesStateService.setAiGeneratedMetadata(
            LessonGenerationType.Video,
            {
              title: payload.title,
              contentType: ContentType.Video,
              duration: Math.round(payload.actualDurationSeconds) ?? 0,
              fileSize: 1,
              blobName: payload.videoOutputBlobNameUrl,
            }
          );

          this.resourcesStateService.updateIsLoading(false);
        }
      },
      { allowSignalWrites: true }
    );

    effect(
      () => {
        const current = this.resourcesStateService.generatedType();
        this.resourcesStateService.setCurrentGeneratedType(current);
      },
      { allowSignalWrites: true }
    );
  }

  ngOnInit(): void {
    this.resetAll();

    const job = this.job();
    if (!job) return;

    this.handleExistingVideoJob(job);
  }

  // ? Confirm Generate
  confirmGenerateVideo() {
    this.handleConfirmGenerate(LessonGenerationType.Video, () => {
      this.handleSaveGeneratedContent(() =>
        this.confirmGenerationRequest(LessonGenerationType.Video)
      );
    });
  }

  private handleSaveGeneratedContent(onSuccess: () => void) {
    const folderId = this.folderId();
    const metadata = this.aiGeneratedMetadataMap();
    const currentGeneratedType = this.currentGeneratedType();

    if (
      !folderId ||
      !metadata ||
      currentGeneratedType === null ||
      currentGeneratedType === undefined
    )
      return;

    this.resourcesStateService.updateIsLoading(true);
    this.toastHandlingService.info(
      'Đang xử lý',
      'Hệ thống đang lưu nội dung đã tạo trước khi bắt đầu tạo mới. Vui lòng chờ trong giây lát...'
    );

    // ? When in video preview, we need to save the other content type (not video)
    const contentTypeToSave = LessonGenerationType.Audio;

    this.aiJobService
      .getFileSizeByBlobNameUrl(metadata[contentTypeToSave].blobName)
      .pipe(
        switchMap(fileSize => {
          const cleanBlobName =
            metadata[contentTypeToSave].blobName.split('?')[0];
          const material: CreateLessonMaterialRequest = {
            title: metadata[contentTypeToSave].title,
            contentType: metadata[contentTypeToSave].contentType,
            duration: metadata[contentTypeToSave].duration,
            fileSize: fileSize,
            isAIContent: true,
            sourceUrl: cleanBlobName,
          };

          const createRequest: CreateLessonMaterialsRequest = {
            folderId,
            blobNames: [cleanBlobName],
            lessonMaterials: [material],
          };

          return this.lessonMaterialService.createLessonMaterials(
            createRequest
          );
        }),
        finalize(() => this.resourcesStateService.updateIsLoading(false))
      )
      .subscribe({
        next: () => {
          // ? Mark the content type that was saved through modal
          this.resourcesStateService.addSavedContentType(contentTypeToSave);
          onSuccess();
        },
      });
  }

  private handleConfirmGenerate(
    type: LessonGenerationType,
    saveBeforeContinue: () => void
  ) {
    const currentGenerated = this.currentGeneratedType();

    if (currentGenerated === type) return;

    if (this.isSubscriptionExpired()) {
      this.confirmGenerationRequest(type);
      return;
    }

    // ? If have any type generated then popup confirmation for user decide to save content or not
    if (currentGenerated !== null && currentGenerated !== type) {
      // ? Check if the current generated content has already been saved
      const isCurrentContentSaved =
        this.resourcesStateService.isContentTypeSaved(currentGenerated);

      // ? If content is already saved, no need to show confirmation modal
      if (isCurrentContentSaved) {
        this.confirmGenerationRequest(type);
        return;
      }

      this.confirmOverwrite(
        () => {
          saveBeforeContinue();
        },
        () => {
          this.confirmGenerationRequest(type);
        }
      );
      return;
    }

    // ? If do not have any type generated then confirm right away
    this.confirmGenerationRequest(type);
  }

  private confirmGenerationRequest(type: LessonGenerationType) {
    const jobId = this.jobId();

    if (!jobId) return;

    const request: ConfirmCreateContent = {
      type,
      voiceConfig: {
        language_code: this.language() ?? 'vi-VN',
        name: this.voice() ?? 'vi-VN-Chirp3-HD-Enceladus',
        speaking_rate: this.speedRate() ?? 1,
      },
    };

    this.resourcesStateService.updateIsLoading(true);
    this.aiJobService
      .confirmCreateContent(jobId, request)
      .pipe(switchMap(() => this.userService.getCurrentProfile()))
      .subscribe({
        next: () => {
          // ? Don't reset saved content types here, only when actually starting generation
          this.resourcesStateService.setVideoState('loading');
          this.resourcesStateService.setGeneratedType(type);
        },
      });
  }

  private confirmOverwrite(onAccept: () => void, onReject: () => void) {
    this.confirmationService.confirm({
      header: 'Nội dung chưa được lưu',
      message: `
        Bạn đã tạo nội dung dưới định dạng <strong>Audio</strong> trước đó.<br/><br/>
        Nếu tiếp tục tạo mới dưới định dạng <strong>Video</strong>, nội dung hiện tại sẽ <span class="text-[#f87171] font-medium">bị thay thế</span>.
        <br/><br/>
        Vui lòng lưu lại nếu bạn muốn giữ nội dung đã tạo.
        ${
          !this.folderId()
            ? '<br/><br/><span class="text-xs text-[#f87171]">* Bạn cần chọn thư mục trước khi có thể lưu nội dung</span>'
            : ''
        }
      `,
      closable: true,
      closeOnEscape: true,
      rejectButtonProps: {
        label: 'Tiếp tục không lưu',
        severity: 'secondary',
        size: 'small',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Lưu và tiếp tục',
        size: 'small',
        disabled: !this.folderId(),
      },
      accept: onAccept,
      reject: onReject,
    });
  }

  private handleExistingVideoJob(job: AiJob): void {
    if (job.videoOutputBlobName) {
      this.resourcesStateService.setVideoState('generated');
      this.resourcesStateService.setVideoUrl(job.videoOutputBlobName);
      this.resourcesStateService.markGeneratedSuccess();

      // ? Set metadata immediately with default values to avoid timing issues
      this.resourcesStateService.setAiGeneratedMetadata(
        LessonGenerationType.Video,
        {
          title: job.topic,
          contentType: ContentType.Video,
          duration: 0,
          fileSize: 1,
          blobName: job.videoOutputBlobName,
        }
      );

      // ? Get file size and duration from the video blob and update metadata
      this.getVideoMetadata(job.videoOutputBlobName, job.topic);
    } else {
      this.resourcesStateService.setVideoState('no-content');
    }
  }

  private getVideoMetadata(blobName: string, title: string): void {
    this.aiJobService.getFileSizeByBlobNameUrl(blobName).subscribe(fileSize => {
      // ? Create video element to get duration
      const video = document.createElement('video');
      video.src = blobName;
      video.addEventListener('loadedmetadata', () => {
        const duration = Math.round(video.duration);

        // ? Update existing metadata with real values
        this.resourcesStateService.setAiGeneratedMetadata(
          LessonGenerationType.Video,
          {
            title: title,
            contentType: ContentType.Video,
            duration: duration,
            fileSize: fileSize,
            blobName: blobName,
          }
        );
      });

      video.addEventListener('error', () => {
        // ? Update metadata with fileSize but keep duration as 0 if video loading fails
        this.resourcesStateService.setAiGeneratedMetadata(
          LessonGenerationType.Video,
          {
            title: title,
            contentType: ContentType.Video,
            duration: 0,
            fileSize: fileSize,
            blobName: blobName,
          }
        );
      });
    });
  }

  private resetAll() {
    this.resourcesStateService.setVideoUrl('');
    this.resourcesStateService.setVideoState('empty');
    this.resourcesStateService.resetSavedContentTypes();
  }
}
