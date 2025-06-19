import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'generate-lesson-mobile',
  standalone: true,
  imports: [],
  templateUrl: './generate-lesson-mobile.component.html',
  styleUrl: './generate-lesson-mobile.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenerateLessonMobileComponent {}
