import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { InputOtpModule } from 'primeng/inputotp';
import { ButtonModule } from 'primeng/button';

import { TwoFactorService } from '../../../../../core/auth/services/two-factor.service';
import { LoadingService } from '../../../../services/core/loading/loading.service';
import { GlobalModalService } from '../../../../services/layout/global-modal/global-modal.service';
import { MODAL_DATA } from '../../../../tokens/injection/modal-data.token';

import { type ConfirmEnableDisable2FA } from '../models/toggle-2fa-request.model';

@Component({
  selector: 'app-otp-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, InputOtpModule, ButtonModule],
  templateUrl: './otp-modal.component.html',
  styleUrl: './otp-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OtpModalComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly twoFactorService = inject(TwoFactorService);
  private readonly loadingService = inject(LoadingService);
  private readonly globalModalService = inject(GlobalModalService);
  readonly modalData = inject(MODAL_DATA);

  value = signal<string>('');

  isLoading = this.loadingService.is('otp-modal');

  readonly countdown = signal<number>(120);
  readonly isResendDisabled = signal<boolean>(true);

  private countdownInterval!: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.startCountdown();

    this.destroyRef.onDestroy(() => {
      clearInterval(this.countdownInterval);
    });
  }

  get isInvalidValue(): boolean {
    const otpCode = this.value();
    return !otpCode || otpCode.length !== 6;
  }

  onSubmit() {
    if (this.isInvalidValue) {
      return;
    }

    const request: ConfirmEnableDisable2FA = {
      otpCode: this.value(),
    };
    this.twoFactorService
      .confirmEnableDisable2FA(request, this.modalData.enabled)
      .subscribe(() => this.closeModal());
  }

  onResendCode() {
    if (this.isResendDisabled()) return;

    // Call API to resend OTP here if needed
    // this.twoFactorService.resendOtp(...)

    this.startCountdown();
  }

  closeModal() {
    this.globalModalService.close();
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
