import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  signal,
} from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';

import { TableModule, type TableLazyLoadEvent } from 'primeng/table';

import { LoadingService } from '../../../../shared/services/core/loading/loading.service';

import { PAGE_SIZE } from '../../../../shared/constants/common.constant';

import {
  BadgeComponent,
  type BadgeVariant,
} from '../../../../shared/components/badge/badge.component';
import { TableSkeletonComponent } from '../../../../shared/components/skeleton/table-skeleton/table-skeleton.component';
import { TableEmptyStateComponent } from '../../../../shared/components/table-empty-state/table-empty-state.component';

import { PaymentStatus } from '../../../../shared/models/entities/payment.model';
import { CreditTransaction } from '../models/response/query/get-credit-transaction-response.model';

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
export class TransactionHistoryComponent {
  private readonly loadingService = inject(LoadingService);

  creditTransactions = input.required<CreditTransaction[]>();
  totalRecords = input.required<number>();

  isLoading = this.loadingService.is('load-transactions');

  currentPage = signal(1);
  pageSize = signal(PAGE_SIZE);
  firstRecordIndex = signal(0);

  tableHeadSkeleton = signal([
    'Thời gian',
    'Mã giao dịch',
    'Số tiền',
    'Số Ecoin',
    'Trạng thái',
  ]);

  onLazyLoad(event: TableLazyLoadEvent): void {
    const rows = event.rows ?? this.pageSize();
    const first = event.first ?? 0;
    const page = Math.floor(first / rows) + 1;

    this.currentPage.set(page);
    this.pageSize.set(rows);
    this.firstRecordIndex.set(first);
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
}
