import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-table-empty-state',
  standalone: true,
  imports: [],
  templateUrl: './table-empty-state.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableEmptyStateComponent {
  icon = input<string>('');
  title = input<string>('Không có dữ liệu');
  subtitle = input<string>('');
}
