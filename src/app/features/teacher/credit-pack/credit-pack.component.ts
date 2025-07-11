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

  currentPage = signal(1);
  pageSize = signal(PAGE_SIZE);
  firstRecordIndex = signal(0);

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
          },
        });
      }
    });

    this.loadCreditPacks();
    this.loadCreditTransactions();
  }

  loadCreditPacks() {
    const request: GetCreditPacksRequest = {
      pageIndex: this.currentPage(),
      pageSize: this.pageSize(),
      sortBy: 'price',
    };
    this.creditPackService.getCreditPacks(request).subscribe();
  }

  loadCreditTransactions() {
    const request: GetCreditTransactionRequest = {
      pageIndex: this.currentPage(),
      pageSize: this.pageSize(),
      sortBy: 'createdAt',
      sortDirection: 'desc',
    };
    this.creditTransactionService.getCreditTransactions(request).subscribe();
  }
}
