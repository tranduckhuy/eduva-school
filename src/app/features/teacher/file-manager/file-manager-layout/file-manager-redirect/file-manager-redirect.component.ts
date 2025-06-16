import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'file-manager-redirect',
  standalone: true,
  imports: [],
  templateUrl: './file-manager-redirect.component.html',
  styleUrl: './file-manager-redirect.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileManagerRedirectComponent {}
