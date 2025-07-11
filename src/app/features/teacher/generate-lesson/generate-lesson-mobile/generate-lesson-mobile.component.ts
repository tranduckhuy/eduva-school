import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TabsModule } from 'primeng/tabs';
import { GenerateLessonChatComponent } from '../generate-lesson-main/generate-lesson-chat/generate-lesson-chat.component';
import { GenerateLessonUploadComponent } from '../generate-lesson-main/generate-lesson-upload/generate-lesson-upload.component';
import { GenerateLessonPreviewComponent } from '../generate-lesson-main/generate-lesson-preview/generate-lesson-preview.component';

@Component({
  selector: 'generate-lesson-mobile',
  standalone: true,
  imports: [
    TabsModule,
    GenerateLessonChatComponent,
    GenerateLessonUploadComponent,
    GenerateLessonPreviewComponent,
  ],
  templateUrl: './generate-lesson-mobile.component.html',
  styleUrl: './generate-lesson-mobile.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenerateLessonMobileComponent {}
