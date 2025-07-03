import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinner } from 'primeng/progressspinner';

import { ResourcesStateService } from '../../services/resources-state.service';

import { VideoPreviewPlayerComponent } from './video-preview-player/video-preview-player.component';

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

  totalResourcesChecked = this.resourcesStateService.checkedSources;

  videoState = signal<'empty' | 'loading' | 'generated'>('empty');

  readonly disableGenerate = computed(() => {
    const uploading = this.resourcesStateService
      .sourceList()
      .some(x => x.isUploading);
    return (
      (this.resourcesStateService.totalSources() === 0 &&
        !this.resourcesStateService.hasInteracted()) ||
      this.resourcesStateService.isLoading() ||
      uploading
    );
  });

  // ? Simulation
  simulateAudioGeneration() {
    this.videoState.set('loading');

    const delay = 3000 + Math.floor(Math.random() * 2000); // 3-5s

    setTimeout(() => {
      this.videoState.set('generated');
    }, delay);
  }
}
