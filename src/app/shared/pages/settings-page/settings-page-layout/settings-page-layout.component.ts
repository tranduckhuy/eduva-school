import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { SettingsPageSidebarComponent } from './settings-page-sidebar/settings-page-sidebar.component';

@Component({
  selector: 'app-settings-page-layout',
  standalone: true,
  imports: [RouterOutlet, SettingsPageSidebarComponent],
  template: `
    <div class="e-container-fluid px-0">
      <div class="e-row e-g-lg-2">
        <div class="e-col-3 e-col-lg-12">
          <settings-page-sidebar />
        </div>

        <div class="e-col-9 e-col-lg-12">
          <router-outlet />
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPageLayoutComponent {}
