import { ChangeDetectionStrategy, Component } from '@angular/core';

import { GenerateLessonUploadComponent } from './generate-lesson-upload/generate-lesson-upload.component';
import { GenerateLessonChatComponent } from './generate-lesson-chat/generate-lesson-chat.component';
import { GenerateLessonPreviewComponent } from './generate-lesson-preview/generate-lesson-preview.component';

@Component({
  selector: 'generate-lesson-main',
  standalone: true,
  imports: [
    GenerateLessonUploadComponent,
    GenerateLessonChatComponent,
    GenerateLessonPreviewComponent,
  ],
  templateUrl: './generate-lesson-main.component.html',
  styleUrl: './generate-lesson-main.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenerateLessonMainComponent {}
