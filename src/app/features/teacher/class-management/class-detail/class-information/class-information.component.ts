import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
} from '@angular/core';

import { ButtonModule } from 'primeng/button';

import { GlobalModalService } from '../../../../../shared/services/layout/global-modal/global-modal.service';

import { ClassOverviewComponent } from './class-overview/class-overview.component';
import { UpdateClassModalComponent } from './update-class-modal/update-class-modal.component';

import { type ClassModel } from '../../../../../shared/models/entities/class.model';

@Component({
  selector: 'class-information',
  standalone: true,
  imports: [ButtonModule, ClassOverviewComponent],
  templateUrl: './class-information.component.html',
  styleUrl: './class-information.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClassInformationComponent {
  private readonly globalModalService = inject(GlobalModalService);

  classModel = input<ClassModel | null>(null);
  folderCount = input<number>(0);
  materialCount = input<number>(0);

  classUpdated = output();
  classFolderAdded = output();

  openEditClassModal() {
    this.globalModalService.open(UpdateClassModalComponent, {
      classId: this.classModel()?.id ?? '',
      name: this.classModel()?.name ?? '',
      backgroundImageUrl: this.classModel()?.backgroundImageUrl ?? '',
      updateClassSuccess: () => {
        this.classUpdated.emit();
        this.globalModalService.close();
      },
    });
  }
}
