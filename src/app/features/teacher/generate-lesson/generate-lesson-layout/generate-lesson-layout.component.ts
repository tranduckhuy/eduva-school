import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { GenerateLessonHeaderComponent } from '../generate-lesson-header/generate-lesson-header.component';

@Component({
  selector: 'app-generate-lesson-layout',
  standalone: true,
  imports: [RouterOutlet, GenerateLessonHeaderComponent],
  template: `
    <div class="flex flex-col px-5">
      <generate-lesson-header />

      <router-outlet />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenerateLessonLayoutComponent {}
