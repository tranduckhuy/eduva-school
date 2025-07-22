import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
  effect,
  computed,
} from '@angular/core';

import { finalize } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ConfirmationService } from 'primeng/api';

import { ResourcesStateService } from '../../services/utils/resources-state.service';
import { GenerateSettingsSelectionService } from '../services/generate-settings-selection.service';
import { ToastHandlingService } from '../../../../../../shared/services/core/toast/toast-handling.service';
import { AiJobsService } from '../../services/api/ai-jobs.service';
import { AiSocketService } from '../../services/api/ai-socket.service';
import { LessonMaterialsService } from '../../../../../../shared/services/api/lesson-materials/lesson-materials.service';

import { JobStatus } from '../../../../../../shared/models/enum/job-status.enum';
import { LessonGenerationType } from '../../../../../../shared/models/enum/lesson-generation-type.enum';
import { ContentType } from '../../../../../../shared/models/enum/lesson-material.enum';

import { AudioPreviewPlayerComponent } from './audio-preview-player/audio-preview-player.component';

import { type ConfirmCreateContent } from '../../models/request/command/confirm-create-content-request.model';
import {
  type CreateLessonMaterialRequest,
  type CreateLessonMaterialsRequest,
} from '../../../../../../shared/models/api/request/command/create-lesson-material-request.model';

@Component({
  selector: 'generated-audio-preview',
  standalone: true,
  imports: [
    ButtonModule,
    TooltipModule,
    ProgressSpinnerModule,
    AudioPreviewPlayerComponent,
  ],
  templateUrl: './audio-preview.component.html',
  styleUrl: './audio-preview.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AudioPreviewComponent implements OnInit {
  private readonly resourcesStateService = inject(ResourcesStateService);
  private readonly generateSettingsService = inject(
    GenerateSettingsSelectionService
  );
  private readonly toastHandlingService = inject(ToastHandlingService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly aiJobService = inject(AiJobsService);
  private readonly aiSocketService = inject(AiSocketService);
  private readonly lessonMaterialService = inject(LessonMaterialsService);

  job = this.aiJobService.job;
  jobId = this.aiJobService.jobId;
  generationType = this.aiJobService.generationType;

  jobUpdateProgress = this.aiSocketService.jobUpdateProgress;

  isLoading = this.resourcesStateService.isLoading;
  totalCheckedSources = this.resourcesStateService.totalCheckedSources;
  hasInteracted = this.resourcesStateService.hasInteracted;
  hasGeneratedSuccessfully =
    this.resourcesStateService.hasGeneratedSuccessfully;

  speedRate = this.generateSettingsService.selectedRate;
  voice = this.generateSettingsService.selectedVoice;
  language = this.generateSettingsService.selectedLanguage;
  folderId = this.generateSettingsService.selectedFolderId;

  audioUrl = signal<string>('');
  audioState = signal<'empty' | 'loading' | 'generated'>('empty');

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
          generationType === LessonGenerationType.Audio
        ) {
          this.audioUrl.set(payload?.audioOutputBlobNameUrl);
          this.audioState.set('generated');

          this.resourcesStateService.setAiGeneratedMetadata({
            title: this.generateAutoTitle(),
            contentType: ContentType.Audio,
            duration: Math.round(payload.actualDurationSeconds) ?? 0,
            fileSize: 1,
            blobName: payload.audioOutputBlobNameUrl,
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
    const audioBlob = this.job()?.audioOutputBlobName;

    if (!audioBlob) return;

    this.audioState.set('generated');
    this.audioUrl.set(audioBlob);

    this.resourcesStateService.markGeneratedSuccess();
  }

  // ? Confirm Generate
  confirmGenerateAudio() {
    this.handleConfirmGenerate(LessonGenerationType.Audio, () => {
      this.handleSaveAudio(() =>
        this.confirmGenerationRequest(LessonGenerationType.Audio)
      );
    });
  }

  private handleSaveAudio(onSuccess: () => void) {
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

    const prefix = 'Audio AI tạo';
    return `${prefix}_${timestamp}`;
  }

  private handleConfirmGenerate(
    type: LessonGenerationType,
    saveBeforeContinue: () => void
  ) {
    const currentGenerated = this.currentGeneratedType();

    if (currentGenerated === type) return;

    if (currentGenerated && currentGenerated !== type) {
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
          this.audioState.set('loading');
          this.resourcesStateService.setGeneratedType(type);
        },
      });
  }

  private confirmOverwrite(onAccept: () => void, onReject: () => void) {
    this.confirmationService.confirm({
      header: 'Nội dung chưa được lưu',
      message: `
        Bạn đã tạo nội dung dưới định dạng <strong>Video</strong> trước đó.<br/><br/>
        Nếu tiếp tục tạo mới dưới định dạng <strong>Audio</strong>, nội dung hiện tại sẽ <span class="text-[#f87171] font-medium">bị thay thế</span>.
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
        disabled: !this.folderId(),
      },
      accept: onAccept,
      reject: onReject,
    });
  }
}
