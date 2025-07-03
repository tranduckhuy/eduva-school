import {
  ChangeDetectionStrategy,
  Component,
  input,
  OnInit,
} from '@angular/core';

import { Skeleton } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-table-skeleton',
  standalone: true,
  imports: [Skeleton, TableModule],
  templateUrl: './table-skeleton.component.html',
  styleUrl: './table-skeleton.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableSkeletonComponent implements OnInit {
  data: any[] | undefined;

  tableHead = input.required<string[]>();
  limit = input<number>(10);

  ngOnInit() {
    this.data = Array.from({ length: this.limit() }).map(
      (_, i) => `Item #${i}`
    );
  }
}
