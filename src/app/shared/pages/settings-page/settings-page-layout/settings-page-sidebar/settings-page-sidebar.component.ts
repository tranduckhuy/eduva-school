import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'settings-page-sidebar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './settings-page-sidebar.component.html',
  styleUrl: './settings-page-sidebar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPageSidebarComponent {}
