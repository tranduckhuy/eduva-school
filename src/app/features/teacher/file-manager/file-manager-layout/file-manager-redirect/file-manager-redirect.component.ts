import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { FolderManagementService } from '../../../../../shared/services/api/folder/folder-management.service';

import { EntityStatus } from '../../../../../shared/models/enum/entity-status.enum';

import { type GetFoldersRequest } from '../../../../../shared/models/api/request/query/get-folders-request.model';

@Component({
  selector: 'file-manager-redirect',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './file-manager-redirect.component.html',
  styleUrl: './file-manager-redirect.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileManagerRedirectComponent implements OnInit {
  private readonly folderManagementService = inject(FolderManagementService);

  totalFolders = this.folderManagementService.totalRecords;

  ngOnInit(): void {
    const request: GetFoldersRequest = {
      searchTerm: '',
      status: EntityStatus.Active,
    };
    this.folderManagementService.getPersonalFolders(request).subscribe();
  }
}
