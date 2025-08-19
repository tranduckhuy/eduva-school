import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { finalize, map, of, switchMap } from 'rxjs';

import { UserService } from '../../../shared/services/api/user/user.service';
import { PaymentService } from '../../../shared/services/api/payment/payment.service';
import { CreditPackTransactionService } from './services/credit-pack-transaction.service';

import { clearQueryParams } from '../../../shared/utils/util-functions';

import { PAGE_SIZE } from '../../../shared/constants/common.constant';

import { ListCreditPackComponent } from './list-credit-pack/list-credit-pack.component';
import { TransactionHistoryComponent } from './transaction-history/transaction-history.component';

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
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly userService = inject(UserService);
  private readonly paymentService = inject(PaymentService);
  private readonly creditTransactionService = inject(
    CreditPackTransactionService
  );

  ngOnInit(): void {
    this.handleRouteQueryParams();
  }

  private handleRouteQueryParams() {
    this.activatedRoute.queryParams
      .pipe(
        map(params => {
          const { code, id, status, orderCode } = params ?? {};
          if (!code || !id || !status || !orderCode) return null;
          const req: ConfirmPaymentReturnRequest = {
            code,
            id,
            status,
            orderCode: +orderCode,
          };
          return req;
        }),
        switchMap(req => {
          if (!req) {
            return of(null);
          }

          return this.paymentService.confirmPaymentReturn(req).pipe(
            switchMap(() => this.userService.getCurrentProfile()),
            switchMap(() =>
              this.creditTransactionService.getCreditTransactions({
                pageIndex: 1,
                pageSize: PAGE_SIZE,
                sortBy: 'createdAt',
                sortDirection: 'desc',
              })
            )
          );
        }),
        finalize(() => {
          clearQueryParams(this.router, this.activatedRoute, [
            'code',
            'id',
            'cancel',
            'status',
            'orderCode',
          ]);
        })
      )
      .subscribe();
  }
}
