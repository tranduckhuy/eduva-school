import { ChangeDetectionStrategy, Component } from '@angular/core';

import { GenerateLessonHeaderComponent } from '../generate-lesson-header/generate-lesson-header.component';
import { GenerateLessonMainComponent } from '../generate-lesson-main/generate-lesson-main.component';

@Component({
  selector: 'app-generate-lesson-layout',
  standalone: true,
  imports: [GenerateLessonHeaderComponent, GenerateLessonMainComponent],
  template: `
    <div class="flex flex-col px-5">
      <generate-lesson-header />

      <generate-lesson-main />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenerateLessonLayoutComponent {}
