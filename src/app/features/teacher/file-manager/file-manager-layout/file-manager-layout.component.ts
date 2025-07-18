import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { FileManagerSidebarComponent } from './file-manager-sidebar/file-manager-sidebar.component';

@Component({
  selector: 'app-file-manager-layout',
  standalone: true,
  imports: [RouterOutlet, FileManagerSidebarComponent],
  template: `
    <div class="e-container-fluid px-0">
      <div class="e-row e-g-lg-2">
        <div class="e-col-3 e-col-lg-12">
          <file-manager-sidebar />
        </div>

        <div class="e-col-9 e-col-lg-12">
          <router-outlet />
        </div>
      </div>
    </div>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileManagerLayoutComponent {}
