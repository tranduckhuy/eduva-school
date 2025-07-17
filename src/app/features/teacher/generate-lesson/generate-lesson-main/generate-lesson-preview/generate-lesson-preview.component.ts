import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { ButtonModule } from 'primeng/button';
import { ScrollPanelModule } from 'primeng/scrollpanel';

import { GlobalModalService } from '../../../../../shared/services/layout/global-modal/global-modal.service';
import { AiSocketService } from '../services/api/ai-socket.service';

import { AudioPreviewComponent } from './audio-preview/audio-preview.component';
import { VideoPreviewComponent } from './video-preview/video-preview.component';
import { GenerateSettingsModalComponent } from './generate-settings-modal/generate-settings-modal.component';

@Component({
  selector: 'generate-lesson-preview',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    ScrollPanelModule,
    AudioPreviewComponent,
    VideoPreviewComponent,
  ],
  templateUrl: './generate-lesson-preview.component.html',
  styleUrl: './generate-lesson-preview.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenerateLessonPreviewComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly globalModalService = inject(GlobalModalService);
  private readonly aiSocketService = inject(AiSocketService);

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.aiSocketService.resetSignal();
      this.aiSocketService.disconnect();
    });
  }

  openModal() {
    this.globalModalService.open(GenerateSettingsModalComponent);
  }
}
