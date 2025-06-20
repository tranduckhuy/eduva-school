import { ChangeDetectionStrategy, Component } from '@angular/core';

import { AudioPreviewComponent } from './audio-preview/audio-preview.component';

@Component({
  selector: 'generate-lesson-preview',
  standalone: true,
  imports: [AudioPreviewComponent],
  templateUrl: './generate-lesson-preview.component.html',
  styleUrl: './generate-lesson-preview.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenerateLessonPreviewComponent {}
