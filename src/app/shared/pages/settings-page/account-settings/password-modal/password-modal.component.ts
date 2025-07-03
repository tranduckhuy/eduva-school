import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';

import { ButtonModule } from 'primeng/button';

import { TwoFactorService } from '../../../../../core/auth/services/two-factor.service';
import { LoadingService } from '../../../../services/core/loading/loading.service';
import { GlobalModalService } from '../../../../services/layout/global-modal/global-modal.service';
import { MODAL_DATA } from '../../../../tokens/injection/modal-data.token';

import { OtpModalComponent } from '../otp-modal/otp-modal.component';

import { type RequestEnableDisable2FA } from '../models/toggle-2fa-request.model';

@Component({
  selector: 'app-password-modal',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, ButtonModule],
  templateUrl: './password-modal.component.html',
  styleUrl: './password-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordModalComponent {
  private readonly fb = inject(FormBuilder);
  private readonly twoFactorService = inject(TwoFactorService);
  private readonly loadingService = inject(LoadingService);
  private readonly globalModalService = inject(GlobalModalService);
  private readonly modalData = inject(MODAL_DATA);

  form: FormGroup;

  isLoading = this.loadingService.is('password-modal');

  isShowPassword = signal<boolean>(false);

  constructor() {
    this.form = this.fb.group({
      currentPassword: ['', Validators.required],
    });
  }

  get currentPassword() {
    return this.form.get('currentPassword')!;
  }

  onBlur(controlName: string) {
    const control = this.form.get(controlName);
    if (control && !control.touched) {
      control.markAsTouched();
    }
  }

  onSubmit() {
    this.form.markAllAsTouched();

    if (this.form.invalid) return;

    const request: RequestEnableDisable2FA = this.form.value;
    this.twoFactorService
      .requestEnableDisable2FA(request, this.modalData.enabled)
      .subscribe({
        next: () => {
          this.closeModal();
          this.openOtpModal();
        },
        error: () => this.form.reset(),
      });
  }

  toggleShowPassword(): void {
    this.isShowPassword.set(!this.isShowPassword());
  }

  getErrorMessage(controlName: string): string {
    const control = this.form.get(controlName);
    if (control?.hasError('required')) {
      return 'Trường này không được để trống';
    }
    return '';
  }

  openOtpModal() {
    this.globalModalService.open(OtpModalComponent, {
      enabled: this.modalData.enabled,
    });
  }

  closeModal() {
    this.globalModalService.close();
  }
}
