import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { CreditPackService } from './services/credit-pack.service';
import { CreditPackTransactionService } from './services/credit-pack-transaction.service';
import { UserService } from '../../../shared/services/api/user/user.service';
import { PaymentService } from '../../../shared/services/api/payment/payment.service';

import { PAGE_SIZE } from '../../../shared/constants/common.constant';

import { ListCreditPackComponent } from './list-credit-pack/list-credit-pack.component';
import { TransactionHistoryComponent } from './transaction-history/transaction-history.component';

import { type GetCreditPacksRequest } from './models/request/query/get-credit-packs-request.model';
import { type GetCreditTransactionRequest } from './models/request/query/get-credit-transaction-request.model';
import { type ConfirmPaymentReturnRequest } from '../../../shared/models/api/request/query/confirm-payment-return-request.model';

type PageChangeValue = {
  currentPage: number;
  pageSize?: number;
};

@Component({
  selector: 'app-credit-pack',
  standalone: true,
  imports: [ListCreditPackComponent, TransactionHistoryComponent],
  templateUrl: './credit-pack.component.html',
  styleUrl: './credit-pack.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreditPackComponent implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly creditPackService = inject(CreditPackService);
  private readonly creditTransactionService = inject(
    CreditPackTransactionService
  );
  private readonly userService = inject(UserService);
  private readonly paymentService = inject(PaymentService);

  creditPacks = this.creditPackService.creditPacks;
  creditTransactions = this.creditTransactionService.creditTransactions;
  totalRecords = this.creditTransactionService.totalRecords;

  currentPage = signal<number>(1);
  pageSize = signal<number>(PAGE_SIZE);
  firstRecordIndex = signal<number>(0);
  shouldStopRequest = signal<boolean>(true);

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      const { code, id, status, orderCode } = params;
      if (code && id && status && orderCode) {
        const confirmRequest: ConfirmPaymentReturnRequest = {
          code,
          id,
          status,
          orderCode: +orderCode,
        };
        this.paymentService.confirmPaymentReturn(confirmRequest).subscribe({
          complete: () => {
            this.userService.getCurrentProfile().subscribe();
            this.loadCreditTransactions({ currentPage: 1 });
          },
        });
      }
    });

    this.loadCreditPacks();
    this.loadCreditTransactions();
  }

  loadCreditPacks() {
    const request: GetCreditPacksRequest = {
      sortBy: 'price',
    };
    this.creditPackService.getCreditPacks(request).subscribe();
  }

  loadCreditTransactions(pageChangeValue?: PageChangeValue) {
    if (!this.shouldStopRequest()) return;

    const request: GetCreditTransactionRequest = {
      pageIndex: pageChangeValue?.currentPage ?? this.currentPage(),
      pageSize: pageChangeValue?.pageSize ?? this.pageSize(),
      sortBy: 'createdAt',
      sortDirection: 'desc',
    };
    this.creditTransactionService.getCreditTransactions(request).subscribe({
      error: () => this.shouldStopRequest.set(false),
    });
  }
}
