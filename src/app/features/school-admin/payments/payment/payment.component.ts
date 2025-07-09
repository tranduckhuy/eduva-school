import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';

import { SchoolPaymentService } from '../service/school-payment.service';
import { StorageFormatPipe } from '../../../../shared/pipes/storage-format.pipe';
import { LoadingService } from '../../../../shared/services/core/loading/loading.service';
import { ExportInvoicePdfComponent } from '../export-invoice-pdf/export-invoice-pdf.component';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [
    DatePipe,
    CurrencyPipe,
    StorageFormatPipe,
    CommonModule,
    ExportInvoicePdfComponent,
  ],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css',
  providers: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentComponent {
  private readonly paymentService = inject(SchoolPaymentService);
  private readonly loadingService = inject(LoadingService);
  private readonly router = inject(Router);

  isLoading = this.loadingService;
  schoolSubscriptionDetail = this.paymentService.schoolSubscriptionDetail;
  creditTransactionDetail = this.paymentService.creditTransactionDetail;

  paymentId = input.required<string>({
    alias: 'paymentId',
  });

  isCreditPack = signal<boolean>(false);

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    const currentUrl = this.router.url;
    const paymentType = currentUrl.split('/')[3];

    if (paymentType === 'credit-pack') {
      this.isCreditPack.set(true);
      this.paymentService
        .getCreditTransactionDetailById(this.paymentId())
        .subscribe();
    } else {
      this.isCreditPack.set(false);
      this.paymentService
        .getSchoolSubscriptionDetailById(this.paymentId())
        .subscribe();
    }
  }
}
