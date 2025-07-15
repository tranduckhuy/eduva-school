import { ChangeDetectionStrategy, Component } from '@angular/core';

import { GenerateLessonSettingsComponent } from './generate-lesson-settings/generate-lesson-settings.component';

@Component({
  selector: 'generate-lesson-header',
  standalone: true,
  imports: [GenerateLessonSettingsComponent],
  templateUrl: './generate-lesson-header.component.html',
  styleUrl: './generate-lesson-header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenerateLessonHeaderComponent {}
