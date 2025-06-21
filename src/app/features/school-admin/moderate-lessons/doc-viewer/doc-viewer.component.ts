import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgxDocViewerModule } from 'ngx-doc-viewer';

@Component({
  selector: 'app-doc-viewer',
  standalone: true,
  imports: [CommonModule, NgxDocViewerModule],
  templateUrl: './doc-viewer.component.html',
  styleUrl: './doc-viewer.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocViewerComponent {
  lessonMaterial = input.required<any>();
}
