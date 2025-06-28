import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { ClassOverviewComponent } from './class-overview/class-overview.component';

@Component({
  selector: 'class-information',
  standalone: true,
  imports: [ButtonModule, ClassOverviewComponent],
  templateUrl: './class-information.component.html',
  styleUrl: './class-information.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClassInformationComponent {}
