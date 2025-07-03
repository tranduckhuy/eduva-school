import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { InputOtpModule } from 'primeng/inputotp';
import { ButtonModule } from 'primeng/button';

import { LoadingService } from '../../../../shared/services/core/loading/loading.service';
import { TwoFactorService } from '../../services/two-factor.service';

import { AuthLayoutComponent } from '../../auth-layout/auth-layout.component';

import { type VerifyOtpRequest } from '../../models/request/verify-otp-request.model';
import {
  ResendOtpPurpose,
  ResendOtpRequest,
} from '../../models/request/resend-otp-request.model';

@Component({
  selector: 'app-otp-confirmation',
  standalone: true,
  imports: [FormsModule, InputOtpModule, ButtonModule, AuthLayoutComponent],
  templateUrl: './otp-confirmation.component.html',
  styleUrl: './otp-confirmation.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OtpConfirmationComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly loadingService = inject(LoadingService);
  private readonly twoFactorService = inject(TwoFactorService);

  isLoading = this.loadingService.isLoading;

  value = signal<string>('');
  email = signal<string>('');
  readonly countdown = signal<number>(10);
  readonly isResendDisabled = signal<boolean>(true);

  private countdownInterval!: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    const emailParam = this.activatedRoute.snapshot.queryParamMap.get('email');
    this.email.set(emailParam ?? '');

    this.startCountdown();

    this.destroyRef.onDestroy(() => {
      clearInterval(this.countdownInterval);
    });
  }

  get isInvalidValue() {
    const otpCode = this.value();
    return !otpCode || otpCode.length !== 6;
  }

  get resendLinkText() {
    return this.isResendDisabled()
      ? `Gửi lại mã (${this.countdown()}s)`
      : 'Gửi lại mã';
  }

  onSubmit() {
    if (this.isInvalidValue) {
      return;
    }

    const request: VerifyOtpRequest = {
      otpCode: this.value(),
      email: this.email(),
    };
    this.twoFactorService.verifyTwoFactor(request).subscribe();
  }

  onResendCode(event: Event) {
    event.preventDefault();

    if (this.isResendDisabled()) return;

    const request: ResendOtpRequest = {
      email: this.email(),
      purpose: ResendOtpPurpose.Login,
    };
    this.twoFactorService
      .resendOtp(request)
      .subscribe(() => this.startCountdown());
  }

  private startCountdown(): void {
    this.isResendDisabled.set(true);
    this.countdown.set(120);

    this.countdownInterval = setInterval(() => {
      const current = this.countdown();
      if (current <= 1) {
        this.stopCountdown();
      } else {
        this.countdown.set(current - 1);
      }
    }, 1000);
  }

  private stopCountdown(): void {
    clearInterval(this.countdownInterval);
    this.isResendDisabled.set(false);
  }
}
