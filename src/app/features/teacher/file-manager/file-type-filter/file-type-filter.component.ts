import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'file-type-filter',
  standalone: true,
  imports: [FormsModule, CheckboxModule],
  templateUrl: './file-type-filter.component.html',
  styleUrl: './file-type-filter.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileTypeFilterComponent {}
