import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  input,
  signal,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

import { switchMap, of } from 'rxjs';

import { ButtonModule } from 'primeng/button';

import { LoadingService } from '../../../../shared/services/core/loading/loading.service';
import { SubscriptionPlanService } from '../services/subscription-plan.service';
import { CreateSchoolService } from '../../../../shared/services/api/school/create-school.service';
import { JwtService } from '../../../../core/auth/services/jwt.service';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { PaymentService } from '../../../../shared/services/api/payment/payment.service';

import { FormControlComponent } from '../../../../shared/components/form-control/form-control.component';
import { SubscriptionPlanCardComponent } from '../subscription-plan-card/subscription-plan-card.component';

import { type CreateSchoolRequest } from '../../../../shared/models/api/request/create-school-request.model';
import { RefreshTokenRequest } from '../../../../core/auth/models/request/refresh-token-request.model';
import {
  BillingCycle,
  CreatePlanPaymentLinkRequest,
} from '../../../../shared/models/api/request/create-plan-payment-link-request.model';

@Component({
  selector: 'app-add-school-information',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    FormControlComponent,
    SubscriptionPlanCardComponent,
  ],
  templateUrl: './add-school-information.component.html',
  styleUrl: './add-school-information.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddSchoolInformationComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly loadingService = inject(LoadingService);
  private readonly subscriptionPlanService = inject(SubscriptionPlanService);
  private readonly createSchoolService = inject(CreateSchoolService);
  private readonly jwtService = inject(JwtService);
  private readonly authService = inject(AuthService);
  private readonly paymentService = inject(PaymentService);

  subscriptionId = input.required<number>();

  form: FormGroup;

  isLoading = this.loadingService.isLoading;
  subscriptionPlan = this.subscriptionPlanService.subscriptionPlan;

  isYearly = signal<boolean>(false);

  constructor() {
    this.form = this.fb.group({
      name: '',
      contactEmail: '',
      contactPhone: '',
      address: '',
      websiteUrl: '',
    });
  }

  ngOnInit(): void {
    this.subscriptionPlanService
      .getSubscriptionPlan(this.subscriptionId())
      .subscribe();
  }

  onSubmit() {
    this.form.markAllAsTouched();

    if (this.form.invalid) return;

    const createSchoolRequest: CreateSchoolRequest = this.form.value;

    this.createSchoolService
      .createSchool(createSchoolRequest)
      .pipe(
        switchMap(() => {
          const accessToken = this.jwtService.getAccessToken();
          const refreshToken = this.jwtService.getRefreshToken();

          if (accessToken && refreshToken) {
            const refreshRequest: RefreshTokenRequest = {
              accessToken,
              refreshToken,
            };
            return this.authService.refreshToken(refreshRequest);
          }

          return of(null);
        }),
        switchMap(() => {
          const paymentLinkRequest: CreatePlanPaymentLinkRequest = {
            planId: this.subscriptionId(),
            billingCycle: this.isYearly()
              ? BillingCycle.Yearly
              : BillingCycle.Monthly,
          };
          return this.paymentService.createPlanPaymentLink(paymentLinkRequest);
        })
      )
      .subscribe(); // Side effects (redirect, toast) đã nằm trong service
  }

  onToggleSwitchChange(_isYearly: boolean) {
    this.isYearly.set(_isYearly);
  }
}
