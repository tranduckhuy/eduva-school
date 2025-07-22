import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'file-manager-redirect',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './file-manager-redirect.component.html',
  styleUrl: './file-manager-redirect.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileManagerRedirectComponent {}
