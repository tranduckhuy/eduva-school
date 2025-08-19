import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';

import { TableModule, type TableLazyLoadEvent } from 'primeng/table';

import { LoadingService } from '../../../../shared/services/core/loading/loading.service';
import { CreditPackTransactionService } from '../services/credit-pack-transaction.service';

import { PAGE_SIZE } from '../../../../shared/constants/common.constant';

import {
  BadgeComponent,
  type BadgeVariant,
} from '../../../../shared/components/badge/badge.component';
import { TableSkeletonComponent } from '../../../../shared/components/skeleton/table-skeleton/table-skeleton.component';
import { TableEmptyStateComponent } from '../../../../shared/components/table-empty-state/table-empty-state.component';

import { PaymentStatus } from '../../../../shared/models/entities/payment.model';
import { type GetCreditTransactionRequest } from '../models/request/query/get-credit-transaction-request.model';

@Component({
  selector: 'credit-transaction-history',
  standalone: true,
  imports: [
    DatePipe,
    CurrencyPipe,
    TableModule,
    BadgeComponent,
    TableSkeletonComponent,
    TableEmptyStateComponent,
  ],
  templateUrl: './transaction-history.component.html',
  styleUrl: './transaction-history.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionHistoryComponent implements OnInit {
  private readonly loadingService = inject(LoadingService);
  private readonly creditTransactionService = inject(
    CreditPackTransactionService
  );

  isLoading = this.loadingService.is('load-transactions');
  totalRecords = this.creditTransactionService.totalRecords;
  creditTransactions = this.creditTransactionService.creditTransactions;

  currentPage = signal(1);
  pageSize = signal(PAGE_SIZE);
  firstRecordIndex = signal(0);
  shouldStopRequest = signal<boolean>(false);
  isRequesting = signal<boolean>(false);

  tableHeadSkeleton = signal([
    'Thời gian',
    'Mã giao dịch',
    'Số tiền',
    'Số Ecoin',
    'Trạng thái',
  ]);

  ngOnInit(): void {
    // PrimeNG will emit onLazyLoad after initial render if lazyLoadOnInit=true (we set false),
    // so we manually trigger the first load here.
    this.loadCreditTransactions();
  }

  onLazyLoad(event: TableLazyLoadEvent): void {
    const rows = event.rows ?? this.pageSize();
    const first = event.first ?? 0;
    const page = Math.floor(first / rows) + 1;

    this.currentPage.set(page);
    this.pageSize.set(rows);
    this.firstRecordIndex.set(first);

    this.loadCreditTransactions(page);
  }

  getPaymentStatusLabel(status: PaymentStatus): string {
    switch (status) {
      case PaymentStatus.Pending:
        return 'Chờ thanh toán';
      case PaymentStatus.Paid:
        return 'Đã thanh toán';
      default:
        return 'Không xác định';
    }
  }

  getPaymentStatusBadge(status: PaymentStatus): BadgeVariant {
    switch (status) {
      case PaymentStatus.Pending:
        return 'info';
      case PaymentStatus.Paid:
        return 'purple';
      default:
        return 'gray';
    }
  }

  private loadCreditTransactions(page?: number) {
    if (this.shouldStopRequest() || this.isRequesting()) return;

    const request: GetCreditTransactionRequest = {
      pageIndex: page ?? this.currentPage(),
      pageSize: this.pageSize(),
      sortBy: 'createdAt',
      sortDirection: 'desc',
    };
    this.isRequesting.set(true);
    this.creditTransactionService.getCreditTransactions(request).subscribe({
      next: () => this.isRequesting.set(false),
      error: () => {
        this.isRequesting.set(false);
        this.shouldStopRequest.set(true);
      },
      complete: () => this.isRequesting.set(false),
    });
  }
}
