import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { ScrollPanelModule } from 'primeng/scrollpanel';

import { AudioPreviewComponent } from './audio-preview/audio-preview.component';
import { VideoPreviewComponent } from './video-preview/video-preview.component';

@Component({
  selector: 'generate-lesson-preview',
  standalone: true,
  imports: [
    ButtonModule,
    ScrollPanelModule,
    AudioPreviewComponent,
    VideoPreviewComponent,
  ],
  templateUrl: './generate-lesson-preview.component.html',
  styleUrl: './generate-lesson-preview.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenerateLessonPreviewComponent {}
