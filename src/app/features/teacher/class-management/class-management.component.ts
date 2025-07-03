import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { ClassManagementService } from './services/class-management.service';
import { GlobalModalService } from '../../../shared/services/layout/global-modal/global-modal.service';
import { LoadingService } from '../../../shared/services/core/loading/loading.service';

import { PAGE_SIZE } from '../../../shared/constants/common.constant';

import { ClassCardComponent } from './class-card/class-card.component';
import { SearchInputComponent } from '../../../shared/components/search-input/search-input.component';
import { GetTeacherClassRequest } from './models/request/query/get-teacher-class-request.model';
import { AddClassModalComponent } from './add-class-modal/add-class-modal.component';

@Component({
  selector: 'app-class-management',
  standalone: true,
  imports: [
    ButtonModule,
    PaginatorModule,
    ProgressSpinnerModule,
    ClassCardComponent,
    SearchInputComponent,
  ],
  templateUrl: './class-management.component.html',
  styleUrl: './class-management.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClassManagementComponent implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly classManagementService = inject(ClassManagementService);
  private readonly globalModalService = inject(GlobalModalService);
  private readonly loadingService = inject(LoadingService);

  classes = this.classManagementService.classes;
  totalClass = this.classManagementService.totalClass;
  isLoading = this.loadingService.isLoading;

  currentPage = signal(1);
  pageSize = signal(PAGE_SIZE);
  searchTerm = signal('');

  first = signal<number>(0);
  rows = signal<number>(PAGE_SIZE);

  isSearching = signal(false);

  ngOnInit(): void {
    this.activatedRoute.queryParamMap.subscribe(params => {
      const page = Number(params.get('page'));
      const size = Number(params.get('pageSize'));

      if (!isNaN(page) && page > 0) {
        this.currentPage.set(page);
      }

      if (!isNaN(size) && size > 0) {
        this.pageSize.set(size);
      }

      const calculatedFirst = (this.currentPage() - 1) * this.pageSize();
      this.first.set(calculatedFirst);
    });

    this.loadClass();
  }

  onPageChange(event: PaginatorState) {
    this.first.set(event.first ?? 0);
    this.rows.set(event.rows ?? PAGE_SIZE);

    const page = this.first() / this.rows() + 1;
    this.currentPage.set(page);

    this.loadClass();
  }

  onSearch(value: string) {
    this.searchTerm.set(value);
    this.currentPage.set(1);
    this.first.set(0);

    this.isSearching.set(!!value.trim());

    this.loadClass();
  }

  openAddClassModal() {
    this.globalModalService.open(AddClassModalComponent, {
      pageIndex: this.currentPage(),
      pageSize: this.pageSize(),
    });
  }

  private loadClass() {
    const request: GetTeacherClassRequest = {
      pageIndex: this.currentPage(),
      pageSize: this.pageSize(),
      searchTerm: this.searchTerm(),
    };
    this.classManagementService.getTeacherClasses(request).subscribe();
  }
}
