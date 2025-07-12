import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { LoadingService } from '../../../../shared/services/core/loading/loading.service';
import { PaymentService } from '../../../../shared/services/api/payment/payment.service';

import { type CreditPack } from '../../../../shared/models/entities/credit-pack.model';
import { type CreateCreditPaymentLinkRequest } from '../../../../shared/models/api/request/command/create-credit-payment-link-request.model';

@Component({
  selector: 'list-credit-pack',
  standalone: true,
  imports: [
    CurrencyPipe,
    ReactiveFormsModule,
    ButtonModule,
    RadioButtonModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './list-credit-pack.component.html',
  styleUrl: './list-credit-pack.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListCreditPackComponent {
  private readonly fb = inject(FormBuilder);
  private readonly loadingService = inject(LoadingService);
  private readonly paymentService = inject(PaymentService);

  creditPacks = input.required<CreditPack[]>();

  isLoadingPacks = this.loadingService.is('load-credit-packs');
  isLoadingSubmit = this.loadingService.is('create-credit-payment-link');

  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      creditPackId: [null, Validators.required],
    });
  }

  onSubmit() {
    if (this.form.invalid) return;

    const request: CreateCreditPaymentLinkRequest = this.form.value;
    this.paymentService.createCreditPaymentLink(request).subscribe();
  }
}
