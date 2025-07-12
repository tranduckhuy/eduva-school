import { ChangeDetectionStrategy, Component } from '@angular/core';

import { GenerateLessonUploadComponent } from './generate-lesson-upload/generate-lesson-upload.component';
import { GenerateLessonChatComponent } from './generate-lesson-chat/generate-lesson-chat.component';
import { GenerateLessonPreviewComponent } from './generate-lesson-preview/generate-lesson-preview.component';
import { GenerateLessonMobileComponent } from '../generate-lesson-mobile/generate-lesson-mobile.component';

@Component({
  selector: 'generate-lesson-main',
  standalone: true,
  imports: [
    GenerateLessonUploadComponent,
    GenerateLessonChatComponent,
    GenerateLessonPreviewComponent,
    GenerateLessonMobileComponent,
  ],
  templateUrl: './generate-lesson-main.component.html',
  styleUrl: './generate-lesson-main.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenerateLessonMainComponent {}
