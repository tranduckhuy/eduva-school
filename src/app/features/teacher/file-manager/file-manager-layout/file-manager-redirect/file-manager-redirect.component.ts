import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { FolderManagementService } from '../../../../../shared/services/api/folder/folder-management.service';

@Component({
  selector: 'file-manager-redirect',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './file-manager-redirect.component.html',
  styleUrl: './file-manager-redirect.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileManagerRedirectComponent {
  private readonly folderManagementService = inject(FolderManagementService);

  totalFolders = this.folderManagementService.totalRecords;
}
