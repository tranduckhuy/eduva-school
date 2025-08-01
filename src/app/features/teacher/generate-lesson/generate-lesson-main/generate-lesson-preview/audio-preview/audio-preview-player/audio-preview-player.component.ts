import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  viewChild,
  inject,
  input,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { switchMap } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { SliderModule } from 'primeng/slider';

import { SubmenuDirective } from '../../../../../../../shared/directives/submenu/submenu.directive';

import { ResourcesStateService } from '../../../services/utils/resources-state.service';
import { GenerateSettingsSelectionService } from '../../services/generate-settings-selection.service';
import { LoadingService } from '../../../../../../../shared/services/core/loading/loading.service';
import { LessonMaterialsService } from '../../../../../../../shared/services/api/lesson-materials/lesson-materials.service';
import { AiJobsService } from '../../../services/api/ai-jobs.service';
import { DownloadGeneratedContentService } from '../../services/download-generated-content.service';

import { LessonGenerationType } from '../../../../../../../shared/models/enum/lesson-generation-type.enum';

import {
  type CreateLessonMaterialRequest,
  type CreateLessonMaterialsRequest,
} from '../../../../../../../shared/models/api/request/command/create-lesson-material-request.model';

@Component({
  selector: 'audio-preview-player',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SubmenuDirective,
    ButtonModule,
    TooltipModule,
    SliderModule,
  ],
  templateUrl: './audio-preview-player.component.html',
  styleUrl: './audio-preview-player.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AudioPreviewPlayerComponent {
  private readonly audio = viewChild<ElementRef<HTMLAudioElement>>('audio');

  private readonly resourceStateService = inject(ResourcesStateService);
  private readonly generateSettingsService = inject(
    GenerateSettingsSelectionService
  );
  private readonly loadingService = inject(LoadingService);
  private readonly lessonMaterialService = inject(LessonMaterialsService);
  private readonly aiJobService = inject(AiJobsService);
  private readonly downloadGeneratedContentService = inject(
    DownloadGeneratedContentService
  );

  audioUrl = input<string>('');

  isLoadingCreateMaterial = this.loadingService.is('create-lesson-materials');
  isLoadingDownload = this.loadingService.is('download-generated-content');
  folderId = this.generateSettingsService.selectedFolderId;

  generatedMetadataMap = this.resourceStateService.aiGeneratedMetadataMap;
  hasGeneratedSuccessfully = this.resourceStateService.hasGeneratedSuccessfully;

  currentTime = signal<number>(0);
  duration = signal<number>(0);
  volume = signal<number>(100);
  playbackRate = signal<number>(1.0);
  audioName = signal<string>('');
  audioState = signal<'empty' | 'loading' | 'generated'>('empty');
  isPlaying = signal<boolean>(false);
  openedMenu = signal<boolean>(false);

  private previousVolume = 100;
  readonly availableRates = [0.5, 0.8, 1.0, 1.2, 1.5, 2.0];

  constructor() {
    effect(() => {
      if (!this.isPlaying()) return;
      const interval = setInterval(() => {
        const audioEl = this.audio()?.nativeElement;
        if (audioEl) {
          this.currentTime.set(Math.floor(audioEl.currentTime));
        }
      }, 500);
      return () => clearInterval(interval);
    });

    effect(() => {
      const rate = this.playbackRate();
      const audioEl = this.audio()?.nativeElement;
      if (audioEl) {
        audioEl.playbackRate = rate;
      }
    });
  }

  get volumeIcon() {
    const v = this.volume();
    if (v === 0) return 'volume_off';
    if (v < 50) return 'volume_down';
    return 'volume_up';
  }

  togglePlayPause() {
    const audioEl = this.audio()?.nativeElement;
    if (!audioEl) return;

    if (this.isPlaying()) {
      audioEl.pause();
      this.isPlaying.set(false);
    } else {
      audioEl.play().then(() => this.isPlaying.set(true));
    }
  }

  toggleMute() {
    const audioEl = this.audio()?.nativeElement;
    if (!audioEl) return;

    const currentVolume = this.volume();

    if (currentVolume === 0) {
      audioEl.volume = this.previousVolume / 100;
      this.volume.set(this.previousVolume);
    } else {
      this.previousVolume = currentVolume;
      audioEl.volume = 0;
      this.volume.set(0);
    }
  }

  rewind(seconds = 10) {
    const audioEl = this.audio()?.nativeElement;
    if (!audioEl) return;

    const newTime = Math.max(0, audioEl.currentTime - seconds);
    audioEl.currentTime = newTime;
    this.currentTime.set(Math.floor(newTime));
  }

  forward(seconds = 10) {
    const audioEl = this.audio()?.nativeElement;
    if (!audioEl) return;

    const newTime = Math.min(audioEl.duration, audioEl.currentTime + seconds);
    audioEl.currentTime = newTime;
    this.currentTime.set(Math.floor(newTime));
  }

  onMetadataLoaded() {
    const audioEl = this.audio()?.nativeElement;
    if (audioEl) {
      this.duration.set(Math.floor(audioEl.duration));

      const src = audioEl.currentSrc || audioEl.src;
      const fileName = src.split('/').pop() ?? '';
      const nameWithoutExtension = fileName.replace(/\.[^/.]+$/, '');

      this.audioName.set(nameWithoutExtension);
    }
  }

  onTimeChange(value?: number) {
    if (value === undefined) return;
    const audioEl = this.audio()?.nativeElement;
    if (audioEl) {
      audioEl.currentTime = value;
      this.currentTime.set(value);
    }
  }

  onVolumeChange(value?: number) {
    if (value === undefined) return;
    const audioEl = this.audio()?.nativeElement;
    if (audioEl) {
      audioEl.volume = value / 100;
      this.volume.set(value);
    }
  }

  onPlaybackRateChange(rate: number) {
    this.playbackRate.set(rate);
  }

  formatTime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    const pad = (n: number) => n.toString().padStart(2, '0');

    if (h > 0) {
      return `${h}:${pad(m)}:${pad(s)}`;
    }
    return `${pad(m)}:${pad(s)}`;
  }

  toggleMenu() {
    this.openedMenu.set(!this.openedMenu());
  }

  onSaveGeneratedContent() {
    const folderId = this.folderId();
    const metadata = this.generatedMetadataMap();

    if (!folderId || !metadata) return;

    this.aiJobService
      .getFileSizeByBlobNameUrl(metadata[LessonGenerationType.Audio].blobName)
      .pipe(
        switchMap(fileSize => {
          const cleanBlobName =
            metadata[LessonGenerationType.Audio].blobName.split('?')[0];
          const material: CreateLessonMaterialRequest = {
            title: metadata[LessonGenerationType.Audio].title,
            contentType: metadata[LessonGenerationType.Audio].contentType,
            duration: metadata[LessonGenerationType.Audio].duration,
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
        })
      )
      .subscribe();
  }

  onDownloadGeneratedContent() {
    const metadata = this.generatedMetadataMap();
    
    if (!metadata) return;

    this.downloadGeneratedContentService
      .downloadGeneratedContent(metadata[LessonGenerationType.Audio].blobName)
      .subscribe();
  }
}
