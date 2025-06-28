import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-table-empty-state',
  standalone: true,
  imports: [],
  templateUrl: './table-empty-state.component.html',
  styleUrl: './table-empty-state.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableEmptyStateComponent {
  icon = input<string>('info');
  title = input<string>('Không có dữ liệu');
  subtitle = input<string>('Vui lòng thêm mới để bắt đầu');
}
