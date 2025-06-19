import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'generate-lesson-preview',
  standalone: true,
  imports: [],
  templateUrl: './generate-lesson-preview.component.html',
  styleUrl: './generate-lesson-preview.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenerateLessonPreviewComponent {}
