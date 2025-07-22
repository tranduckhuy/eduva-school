import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  OnChanges,
  SimpleChanges,
  inject,
  input,
} from '@angular/core';

import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { AiJobsService } from './services/api/ai-jobs.service';
import { AiSocketService } from './services/api/ai-socket.service';
import { LoadingService } from '../../../../shared/services/core/loading/loading.service';
import { ResourcesStateService } from './services/utils/resources-state.service';

import { GenerateLessonUploadComponent } from './generate-lesson-upload/generate-lesson-upload.component';
import { GenerateLessonChatComponent } from './generate-lesson-chat/generate-lesson-chat.component';
import { GenerateLessonPreviewComponent } from './generate-lesson-preview/generate-lesson-preview.component';
import { GenerateLessonMobileComponent } from '../generate-lesson-mobile/generate-lesson-mobile.component';

@Component({
  selector: 'generate-lesson-main',
  standalone: true,
  imports: [
    ProgressSpinnerModule,
    GenerateLessonUploadComponent,
    GenerateLessonChatComponent,
    GenerateLessonPreviewComponent,
    GenerateLessonMobileComponent,
  ],
  templateUrl: './generate-lesson-main.component.html',
  styleUrl: './generate-lesson-main.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenerateLessonMainComponent implements OnInit, OnChanges {
  private readonly destroyRef = inject(DestroyRef);
  private readonly aiJobService = inject(AiJobsService);
  private readonly aiSocketService = inject(AiSocketService);
  private readonly loadingService = inject(LoadingService);
  private readonly resourceStateService = inject(ResourcesStateService);

  jobId = input<string>();

  isLoading = this.loadingService.is('get-job-detail');
  job = this.aiJobService.job;

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.aiSocketService.disconnect();
      this.resourceStateService.resetAll();
    });
  }

  ngOnInit(): void {
    const jobId = this.jobId();

    if (!jobId) return;

    this.aiJobService.getJobById(jobId).subscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['jobId']) {
      const newJobId = this.jobId();
      if (newJobId) {
        this.resourceStateService.resetAll();
        this.aiJobService.getJobById(newJobId).subscribe();
      } else {
        this.aiJobService.clearJob();
      }
    }
  }
}
