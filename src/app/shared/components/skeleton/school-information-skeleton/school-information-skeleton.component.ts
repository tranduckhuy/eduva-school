import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-school-information-skeleton',
  standalone: true,
  imports: [SkeletonModule],
  templateUrl: './school-information-skeleton.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SchoolInformationSkeletonComponent {
  isSchoolInformation = input.required<boolean>();
}
