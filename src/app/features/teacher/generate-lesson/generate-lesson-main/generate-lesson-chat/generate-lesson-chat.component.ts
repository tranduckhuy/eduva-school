import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'generate-lesson-chat',
  standalone: true,
  imports: [],
  templateUrl: './generate-lesson-chat.component.html',
  styleUrl: './generate-lesson-chat.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenerateLessonChatComponent {}
