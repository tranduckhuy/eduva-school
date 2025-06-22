import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';

import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { SearchInputComponent } from '../../../../shared/components/search-input/search-input.component';
import { FileTypeFilterComponent } from '../file-type-filter/file-type-filter.component';
import { LessonMaterialViewComponent } from '../lesson-material-view/lesson-material-view.component';
import { AddFileModalComponent } from '../add-file-modal/add-file-modal.component';
import { AddLessonModalComponent } from '../add-lesson-modal/add-lesson-modal.component';
import { GlobalModalService } from '../../../../shared/services/layout/global-modal/global-modal.service';

@Component({
  selector: 'app-my-drive',
  standalone: true,
  imports: [
    ButtonComponent,
    SearchInputComponent,
    FileTypeFilterComponent,
    LessonMaterialViewComponent,
    LessonMaterialViewComponent,
  ],
  templateUrl: './my-drive.component.html',
  styleUrl: './my-drive.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyDriveComponent {
  private readonly globalModalService = inject(GlobalModalService);

  currentView = signal<'lesson' | 'material'>('lesson');

  onSearchTriggered(view: 'lesson' | 'material' = 'lesson') {}

  openAddLessonModal() {
    this.globalModalService.open(AddLessonModalComponent);
  }

  openAddMaterialsModal() {
    this.globalModalService.open(AddFileModalComponent);
  }

  backToLessonList() {
    this.currentView.set('lesson');
  }
}
