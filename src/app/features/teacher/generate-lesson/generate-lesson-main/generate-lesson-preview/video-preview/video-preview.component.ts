import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinner } from 'primeng/progressspinner';

import { ResourcesStateService } from '../../services/utils/resources-state.service';

import { VideoPreviewPlayerComponent } from './video-preview-player/video-preview-player.component';
import { GenerateSettingsSelectionService } from '../services/generate-settings-selection.service';
import { AiJobsService } from '../../services/api/ai-jobs.service';
import { AiSocketService } from '../../services/api/ai-socket.service';
import { ConfirmCreateContent } from '../../models/request/command/confirm-create-content-request.model';
import { LessonGenerationType } from '../../../../../../shared/models/enum/lesson-generation-type.enum';
import { JobStatus } from '../../../../../../shared/models/enum/job-status.enum';

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
export class VideoPreviewComponent {
  private readonly resourcesStateService = inject(ResourcesStateService);
  private readonly generateSettingsService = inject(
    GenerateSettingsSelectionService
  );
  private readonly aiJobService = inject(AiJobsService);
  private readonly aiSocketService = inject(AiSocketService);

  jobUpdateProgress = this.aiSocketService.jobUpdateProgress;
  jobId = this.aiJobService.jobId;
  generationType = this.aiJobService.generationType;

  isLoading = this.resourcesStateService.isLoading;
  hasInteracted = this.resourcesStateService.hasInteracted;
  totalCheckedSources = this.resourcesStateService.totalCheckedSources;

  speedRate = this.generateSettingsService.selectedRate;
  voice = this.generateSettingsService.selectedVoice;
  language = this.generateSettingsService.selectedLanguage;

  videoUrl = signal<string>('');
  videoState = signal<'empty' | 'loading' | 'generated'>('empty');

  readonly disableGenerate = computed(() => {
    const uploading = this.resourcesStateService
      .sourceList()
      .some(x => x.isUploading);
    const generated = this.resourcesStateService.hasGeneratedSuccessfully();

    return (
      (this.totalCheckedSources() === 0 && !this.hasInteracted()) ||
      this.isLoading() ||
      uploading ||
      !generated ||
      !this.speedRate() ||
      !this.voice() ||
      !this.language()
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
          this.videoUrl.set(payload?.productBlobNameUrl);
          this.videoState.set('generated');
        }
      },
      { allowSignalWrites: true }
    );
  }

  // ? Confirm Generate
  confirmGenerateAudio() {
    this.videoState.set('loading');

    const jobId = this.jobId();

    if (!jobId) return;

    const request: ConfirmCreateContent = {
      type: LessonGenerationType.Video,
      voiceConfig: {
        language_code: this.language() ?? 'vi-VN',
        name: this.voice() ?? '',
        speaking_rate: this.speedRate() ?? 1,
      },
    };

    this.aiJobService.confirmCreateContent(jobId, request).subscribe();
  }
}
