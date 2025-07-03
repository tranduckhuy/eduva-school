import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { ClassOverviewComponent } from './class-overview/class-overview.component';

import { type ClassModel } from '../../../../../shared/models/entities/class.model';
import { type FolderWithMaterials } from '../class-detail.component';

@Component({
  selector: 'class-information',
  standalone: true,
  imports: [ButtonModule, ClassOverviewComponent],
  templateUrl: './class-information.component.html',
  styleUrl: './class-information.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClassInformationComponent {
  classModel = input<ClassModel | null>(null);
  folderWithMaterials = input<FolderWithMaterials[]>([]);
  folderCount = input<number>(0);
  materialCount = input<number>(0);

  classFolderAdded = output();
}
