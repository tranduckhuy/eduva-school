import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ProgressBarModule } from 'primeng/progressbar';
import { TooltipModule } from 'primeng/tooltip';

import { FileManagerRedirectComponent } from '../file-manager-redirect/file-manager-redirect.component';

@Component({
  selector: 'file-manager-sidebar',
  standalone: true,
  imports: [ProgressBarModule, TooltipModule, FileManagerRedirectComponent],
  templateUrl: './file-manager-sidebar.component.html',
  styleUrl: './file-manager-sidebar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileManagerSidebarComponent {}
