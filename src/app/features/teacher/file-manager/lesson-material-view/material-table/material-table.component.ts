import {
  ChangeDetectionStrategy,
  Component,
  input,
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

type Material = {
  id: number;
  name: string;
  owner: string;
  lastModified: string;
  fileSize: string;
  fileType: '.mp4' | '.mp3' | '.docx' | '.pdf';
};

@Component({
  selector: 'material-table',
  standalone: true,
  imports: [TooltipModule, TableModule, ButtonComponent],
  templateUrl: './material-table.component.html',
  styleUrl: './material-table.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MaterialTableComponent {
  materials = input.required<Material[]>();
  lesson = input<Lesson>();

  totalRecords = signal<number>(0);
  totalMaterialRecords = signal<number>(0);
  loading = signal<boolean>(false);
  first = signal<number>(0);

  rows = signal<number>(0);

  ngOnInit(): void {
    this.totalRecords.set(this.materials.length);
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
    return this.materials()
      ? this.first() + this.rows() >= this.materials().length
      : true;
  }

  isFirstPage(): boolean {
    return this.materials() ? this.first() === 0 : true;
  }
}
