import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';

import { finalize } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinner } from 'primeng/progressspinner';
import { ConfirmationService } from 'primeng/api';

import { ResourcesStateService } from '../../services/utils/resources-state.service';
import { GenerateSettingsSelectionService } from '../services/generate-settings-selection.service';
import { ToastHandlingService } from '../../../../../../shared/services/core/toast/toast-handling.service';
import { AiJobsService } from '../../services/api/ai-jobs.service';
import { AiSocketService } from '../../services/api/ai-socket.service';
import { LessonMaterialsService } from '../../../../../../shared/services/api/lesson-materials/lesson-materials.service';

import { LessonGenerationType } from '../../../../../../shared/models/enum/lesson-generation-type.enum';
import { JobStatus } from '../../../../../../shared/models/enum/job-status.enum';
import { ContentType } from '../../../../../../shared/models/enum/lesson-material.enum';

import { VideoPreviewPlayerComponent } from './video-preview-player/video-preview-player.component';

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
  private readonly confirmationService = inject(ConfirmationService);
  private readonly toastHandlingService = inject(ToastHandlingService);
  private readonly aiJobService = inject(AiJobsService);
  private readonly aiSocketService = inject(AiSocketService);
  private readonly lessonMaterialService = inject(LessonMaterialsService);

  job = this.aiJobService.job;
  jobId = this.aiJobService.jobId;
  generationType = this.aiJobService.generationType;

  jobUpdateProgress = this.aiSocketService.jobUpdateProgress;

  isLoading = this.resourcesStateService.isLoading;
  hasInteracted = this.resourcesStateService.hasInteracted;
  hasGeneratedSuccessfully =
    this.resourcesStateService.hasGeneratedSuccessfully;
  totalCheckedSources = this.resourcesStateService.totalCheckedSources;

  speedRate = this.generateSettingsService.selectedRate;
  voice = this.generateSettingsService.selectedVoice;
  language = this.generateSettingsService.selectedLanguage;
  folderId = this.generateSettingsService.selectedFolderId;

  videoUrl = signal<string>('');
  videoState = signal<'empty' | 'loading' | 'generated'>('empty');

  currentGeneratedType = signal<LessonGenerationType | null>(null);

  readonly disableGenerate = computed(() => {
    const uploading = this.resourcesStateService
      .sourceList()
      .some(x => x.isUploading);

    return (
      uploading ||
      this.isLoading() ||
      this.hasGeneratedSuccessfully() ||
      !this.speedRate() ||
      !this.voice() ||
      !this.language() ||
      (this.totalCheckedSources() === 0 && !this.hasInteracted())
    );
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
          jobStatus === JobStatus.Completed &&
          !failureReason &&
          generationType === LessonGenerationType.Video
        ) {
          this.videoUrl.set(payload.videoOutputBlobNameUrl);
          this.videoState.set('generated');

          this.resourcesStateService.setAiGeneratedMetadata({
            title: this.generateAutoTitle(),
            contentType: ContentType.Video,
            duration: Math.round(payload.actualDurationSeconds) ?? 0,
            fileSize: 1,
            blobName: payload.videoOutputBlobNameUrl,
          });
        }
      },
      { allowSignalWrites: true }
    );

    effect(
      () => {
        const current = this.resourcesStateService.generatedType();
        this.currentGeneratedType.set(current);
      },
      { allowSignalWrites: true }
    );
  }

  ngOnInit(): void {
    const videoBlob = this.job()?.videoOutputBlobName;

    if (!videoBlob) return;

    this.videoState.set('generated');
    this.videoUrl.set(videoBlob);

    this.resourcesStateService.markGeneratedSuccess();
  }

  // ? Confirm Generate
  confirmGenerateVideo() {
    this.handleConfirmGenerate(LessonGenerationType.Video, () => {
      this.handleSaveVideo(() =>
        this.confirmGenerationRequest(LessonGenerationType.Video)
      );
    });
  }

  private handleSaveVideo(onSuccess: () => void) {
    const folderId = this.folderId();
    const metadata = this.resourcesStateService.aiGeneratedMetadata();

    if (!folderId || !metadata) return;

    const cleanBlobName = metadata.blobName.split('?')[0];
    const material: CreateLessonMaterialRequest = {
      title: metadata.title,
      contentType: metadata.contentType,
      duration: metadata.duration,
      fileSize: metadata.fileSize,
      isAIContent: true,
      sourceUrl: cleanBlobName,
    };

    const createRequest: CreateLessonMaterialsRequest = {
      folderId,
      blobNames: [cleanBlobName],
      lessonMaterials: [material],
    };

    this.resourcesStateService.updateIsLoading(true);
    this.toastHandlingService.info(
      'Đang xử lý',
      'Hệ thống đang lưu nội dung đã tạo trước khi bắt đầu tạo mới. Vui lòng chờ trong giây lát...'
    );
    this.lessonMaterialService
      .createLessonMaterials(createRequest)
      .pipe(finalize(() => this.resourcesStateService.updateIsLoading(false)))
      .subscribe({
        next: () => {
          this.resourcesStateService.clearAiGeneratedMetadata();
          onSuccess();
        },
      });
  }

  private generateAutoTitle() {
    const now = new Date();
    const timestamp = now
      .toISOString()
      .replace(/[-:.TZ]/g, '')
      .slice(0, 14);

    const prefix = 'Video AI tạo';
    return `${prefix}_${timestamp}`;
  }

  private handleConfirmGenerate(
    type: LessonGenerationType,
    saveBeforeContinue: () => void
  ) {
    const currentGenerated = this.currentGeneratedType();

    if (currentGenerated === type) return;

    // ? If have any type generated then popup confirmation for user decide to save content or not
    if (currentGenerated !== type) {
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
        name: this.voice() ?? 'vi-VN-Chirp3-HD-Despina',
        speaking_rate: this.speedRate() ?? 1,
      },
    };

    this.resourcesStateService.updateIsLoading(true);
    this.aiJobService
      .confirmCreateContent(jobId, request)
      .pipe(finalize(() => this.resourcesStateService.updateIsLoading(false)))
      .subscribe({
        next: () => {
          this.videoState.set('loading');
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
      `,
      closable: false,
      rejectButtonProps: {
        label: 'Tiếp tục không lưu',
        severity: 'secondary',
        size: 'small',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Lưu và tiếp tục',
        size: 'small',
      },
      accept: onAccept,
      reject: onReject,
    });
  }
}
