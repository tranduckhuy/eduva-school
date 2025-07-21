import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  computed,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { FolderManagementService } from '../../../../../shared/services/api/folder/folder-management.service';
import { LessonMaterialsService } from '../../../../../shared/services/api/lesson-materials/lesson-materials.service';

import { EntityStatus } from '../../../../../shared/models/enum/entity-status.enum';

import { type GetFoldersRequest } from '../../../../../shared/models/api/request/query/get-folders-request.model';
import { type GetPersonalLessonMaterialsRequest } from '../../../../../shared/models/api/request/query/get-lesson-materials-request.model';

@Component({
  selector: 'file-manager-redirect',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './file-manager-redirect.component.html',
  styleUrl: './file-manager-redirect.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileManagerRedirectComponent implements OnInit {
  private readonly folderManagementService = inject(FolderManagementService);
  private readonly lessonMaterialService = inject(LessonMaterialsService);

  totalFolders = this.folderManagementService.totalRecords;
  trashFolderCount = this.folderManagementService.totalTrashRecords;
  trashMaterialCount = this.lessonMaterialService.totalRecords;

  trashTotalCount = computed(
    () => this.trashFolderCount() + this.trashMaterialCount()
  );

  ngOnInit(): void {
    this.loadAllFolderCounts();
    this.loadTrashCounts();
  }

  private loadAllFolderCounts() {
    const request: GetFoldersRequest = {
      status: EntityStatus.Active,
    };
    this.folderManagementService.getPersonalFolders(request).subscribe();
  }

  private loadTrashCounts(): void {
    const folderRequest: GetFoldersRequest = {
      status: EntityStatus.Archived,
      isPaging: true,
    };
    this.folderManagementService.getPersonalFolders(folderRequest).subscribe();

    const materialRequest: GetPersonalLessonMaterialsRequest = {
      entityStatus: EntityStatus.Deleted,
      isPagingEnabled: true,
    };
    this.lessonMaterialService
      .getPersonalLessonMaterials(materialRequest)
      .subscribe();
  }
}
