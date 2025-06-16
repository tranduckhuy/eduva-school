import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
} from '@angular/core';

import { TooltipModule } from 'primeng/tooltip';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';

import { ButtonComponent } from '../../../../../shared/components/button/button.component';

type Lesson = {
  id: number;
  name: string;
  owner: string;
  lastModified: string;
};

@Component({
  selector: 'lesson-table',
  standalone: true,
  imports: [TooltipModule, TableModule, ButtonComponent],
  templateUrl: './lesson-table.component.html',
  styleUrl: './lesson-table.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LessonTableComponent {
  lessons = input.required<Lesson[]>();
  viewMaterials = output<Lesson>();

  totalRecords = signal<number>(0);
  totalMaterialRecords = signal<number>(0);
  loading = signal<boolean>(false);
  first = signal<number>(0);

  rows = signal<number>(0);

  ngOnInit(): void {
    this.totalRecords.set(this.lessons.length);
  }

  loadDataLazy(event: TableLazyLoadEvent) {
    // const rows = event.rows ?? 10;
    // const first = event.first ?? 0;
    // const page = first / rows;
    // this.myService.getProducts(page, rows, event.sortField, event.sortOrder, event.filters)
    //   .subscribe(data => {
    //     this.products = data.items;
    //     this.totalRecords = data.total;
    //     this.loading = false;
    //   });
  }

  onSearchTriggered(term: string) {}

  next() {
    this.first.set(this.first() + this.rows());
  }

  prev() {
    this.first.set(this.first() - this.rows());
  }

  pageChange(event: any) {
    console.log(this.first());

    this.first.set(event.first);
    this.rows.set(event.rows);
  }

  isLastPage(): boolean {
    return this.lessons()
      ? this.first() + this.rows() >= this.lessons().length
      : true;
  }

  isFirstPage(): boolean {
    return this.lessons() ? this.first() === 0 : true;
  }
}
