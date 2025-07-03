import { ChangeDetectionStrategy, Component } from '@angular/core';

import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-preview-lesson-skeleton',
  standalone: true,
  imports: [SkeletonModule],
  templateUrl: './preview-lesson-skeleton.component.html',
  styleUrl: './preview-lesson-skeleton.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreviewLessonSkeletonComponent {}
