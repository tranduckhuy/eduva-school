import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-my-drive',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './my-drive.component.html',
  styleUrl: './my-drive.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyDriveComponent {}
