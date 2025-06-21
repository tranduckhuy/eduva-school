import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-video-viewer',
  standalone: true,
  imports: [],
  templateUrl: './video-viewer.component.html',
  styleUrl: './video-viewer.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoViewerComponent {}
