import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Select } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';

import { LeadingZeroPipe } from '../../../shared/pipes/leading-zero.pipe';

import { SchoolPaymentService } from './service/school-payment.service';
import { LoadingService } from '../../../shared/services/core/loading/loading.service';

import { PAGE_SIZE } from '../../../shared/constants/common.constant';

import { ButtonComponent } from '../../../shared/components/button/button.component';
import { TableSkeletonComponent } from '../../../shared/components/skeleton/table-skeleton/table-skeleton.component';
import { TableEmptyStateComponent } from '../../../shared/components/table-empty-state/table-empty-state.component';

import { type PaymentListParams } from './model/payment-list-params';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    ButtonComponent,
    TableModule,
    LeadingZeroPipe,
    TooltipModule,
    RouterLink,
    FormsModule,
    Select,
    TableSkeletonComponent,
    TableEmptyStateComponent,
  ],
  templateUrl: './payments.component.html',
  styleUrl: './payments.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentsComponent implements OnInit {
  private readonly paymentService = inject(SchoolPaymentService);
  private readonly loadingService = inject(LoadingService);

  // Pagination & Sorting signals
  first = signal<number>(0);
  rows = signal<number>(PAGE_SIZE);
  sortField = signal<string | null>(null);
  sortOrder = signal<number>(-1); // 1 = asc, -1 = desc
  paymentPurpose = signal<0 | 1 | undefined>(undefined); // 1 = SchoolSubscription, 0 = CreditPackage
  selectedTimeFilter = signal<
    { name: string; value: string | undefined } | undefined
  >(undefined);
  searchTerm = signal<string>('');
  tableHeadSkeleton = signal([
    'STT',
    'Khách hàng',
    'Mã đơn',
    'Giá',
    'Phân Loại',
    'Phương thức',
    'Ngày tạo',
    'Hành động',
  ]);

  readonly timeFilterOptions = signal([
    { name: 'Mới nhất', value: 'desc' },
    { name: 'Cũ nhất', value: 'asc' },
  ]);

  // Signals from service
  isLoadingGet = this.loadingService.is('get-payments');

  payments = this.paymentService.payments;
  totalPayments = this.paymentService.totalPayments;

  ngOnInit(): void {
    this.loadData();
  }

  onTimeFilterChange(
    selected: { name: string; value: string | undefined } | undefined
  ): void {
    this.selectedTimeFilter.set(selected);

    if (selected?.value) {
      this.sortField.set('createdAt');
      this.sortOrder.set(selected.value === 'desc' ? -1 : 1);
    } else {
      this.sortField.set(null);
      this.sortOrder.set(-1);
    }

    this.first.set(0);
    this.loadData();
  }

  loadDataLazy(event: TableLazyLoadEvent): void {
    const first = event.first ?? 0;
    const rows = event.rows ?? PAGE_SIZE;

    // Handle sorting
    if (event.sortField) {
      this.sortField.set(
        Array.isArray(event.sortField) ? event.sortField[0] : event.sortField
      );
      this.sortOrder.set(event.sortOrder ?? 1);
    }

    this.first.set(first);
    this.rows.set(rows);

    this.loadData();
  }

  getCreditPayments() {
    this.paymentPurpose.set(0);
    this.loadData();
  }

  getSubscriptionPlansPayments() {
    this.paymentPurpose.set(1);
    this.loadData();
  }

  getAllPayments() {
    this.paymentPurpose.set(undefined);
    this.loadData();
  }

  onSearchTriggered(term: string): void {
    this.searchTerm.set(term);
    this.sortField.set('name');
    this.sortOrder.set(-1);
    this.first.set(0); // Reset to first page when search changes
    this.loadData();
  }

  private loadData(): void {
    const params: PaymentListParams = {
      pageIndex: Math.floor(this.first() / this.rows()) + 1,
      pageSize: this.rows(),
      searchTerm: this.searchTerm(),
      sortBy: this.sortField() ?? 'createdAt',
      sortDirection: this.sortOrder() === 1 ? 'asc' : 'desc',
      paymentPurpose: this.paymentPurpose(),
      paymentStatus: 1,
      paymentMethod: 1,
    };

    this.paymentService.getPayments(params).subscribe();
  }
}
