import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, CurrencyPipe } from '@angular/common';

import {
  ToggleSwitchChangeEvent,
  ToggleSwitchModule,
} from 'primeng/toggleswitch';

import { StorageFormatPipe } from '../../../../shared/pipes/storage-format.pipe';

import { ButtonComponent } from '../../../../shared/components/button/button.component';

import { UserService } from '../../../../shared/services/api/user/user.service';
import { PaymentService } from '../../../../shared/services/api/payment/payment.service';
import { ToastHandlingService } from '../../../../shared/services/core/toast/toast-handling.service';

import { type SubscriptionPlan } from '../../../../shared/models/entities/subscription-plan.model';
import {
  BillingCycle,
  type CreatePlanPaymentLinkRequest,
} from '../../../../shared/models/api/request/command/create-plan-payment-link-request.model';

@Component({
  selector: 'subscription-plan-card',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    StorageFormatPipe,
    ToggleSwitchModule,
    ButtonComponent,
  ],
  templateUrl: './subscription-plan-card.component.html',
  styleUrl: './subscription-plan-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubscriptionPlanCardComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);
  private readonly paymentService = inject(PaymentService);
  private readonly toastHandlingService = inject(ToastHandlingService);

  subscriptionPlan = input.required<SubscriptionPlan>();
  isCurrent = input<boolean>(false);
  isYearly = input<boolean>(false);

  toggleSwitchChange = output<boolean>();

  user = this.userService.currentUser;

  isShowToggle = signal<boolean>(false);
  subscriptionPlanOptions = signal<string[]>([
    'Dashboard nâng cao',
    'Tạo bài giảng âm thanh',
    'Tạo video bài giảng',
    'Báo cáo chi tiết',
    'Hỗ trợ kỹ thuật 24/7',
  ]);

  ngOnInit(): void {
    const currentUrl = this.router.url;
    this.isShowToggle.set(currentUrl.includes('add-school-information'));
  }

  onToggleSwitchChange(event: ToggleSwitchChangeEvent) {
    this.toggleSwitchChange.emit(event.checked);
  }

  onClickBuyButton() {
    const user = this.user();
    const plan = this.subscriptionPlan();
    const isYearly = this.isYearly();

    if (!user) {
      this.toastHandlingService.error(
        'Lỗi',
        'Không tìm thấy thông tin người dùng.'
      );
      return;
    }

    if (!plan) {
      this.toastHandlingService.error('Lỗi', 'Không tìm thấy gói đăng ký.');
      return;
    }

    if (!user.school) {
      this.router.navigate(['/school-admin/add-school-information', plan.id]);
      return;
    }

    this.toastHandlingService.info(
      'Hệ thống đang xử lý yêu cầu thanh toán',
      'Xin vui lòng đợi trong giây lát. Bạn sẽ được chuyển hướng khi liên kết sẵn sàng. Trân trọng cảm ơn!'
    );

    const request: CreatePlanPaymentLinkRequest = {
      planId: plan.id,
      billingCycle: isYearly ? BillingCycle.Yearly : BillingCycle.Monthly,
    };
    this.paymentService.createPlanPaymentLink(request).subscribe();
  }
}
