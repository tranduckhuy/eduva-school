import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';

import { GlobalModalService } from '../../../../shared/services/layout/global-modal/global-modal.service';

import { type Folder } from '../../../../shared/models/entities/folder.model';

import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { SearchInputComponent } from '../../../../shared/components/search-input/search-input.component';
import { FileTypeFilterComponent } from '../file-type-filter/file-type-filter.component';
import { AddFileModalComponent } from '../add-file-modal/add-file-modal.component';
import { AddLessonModalComponent } from '../add-lesson-modal/add-lesson-modal.component';
import { LessonTableComponent } from '../lesson-table/lesson-table.component';
import { MaterialTableComponent } from '../material-table/material-table.component';

@Component({
  selector: 'app-my-drive',
  standalone: true,
  imports: [
    ButtonComponent,
    SearchInputComponent,
    FileTypeFilterComponent,
    LessonTableComponent,
    MaterialTableComponent,
  ],
  templateUrl: './my-drive.component.html',
  styleUrl: './my-drive.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyDriveComponent {
  private readonly globalModalService = inject(GlobalModalService);

  selectedLesson = signal<Folder | null>(null);
  searchValue = signal<string>('');
  currentView = signal<'lesson' | 'material'>('lesson');

  onSearchTriggered(view: 'lesson' | 'material' = 'lesson') {}

  onViewMaterials(lesson: Folder) {
    this.selectedLesson.set(lesson);
    this.currentView.set('material');
  }

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
