import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'file-manager-redirect',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './file-manager-redirect.component.html',
  styleUrl: './file-manager-redirect.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileManagerRedirectComponent {}
