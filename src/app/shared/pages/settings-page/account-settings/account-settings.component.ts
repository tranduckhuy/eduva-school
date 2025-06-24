import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ButtonModule } from 'primeng/button';

import { LoadingService } from '../../../services/core/loading/loading.service';
import { PasswordService } from '../../../../core/auth/services/password.service';

import { isFormFieldMismatch } from '../../../utils/util-functions';

import { FormControlComponent } from '../../../components/form-control/form-control.component';

import { type ChangePasswordRequest } from '../../../models/api/request/change-password-request.model';

@Component({
  selector: 'app-account-settings',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    ReactiveFormsModule,
    ToggleSwitchModule,
    ButtonModule,
    FormControlComponent,
  ],
  templateUrl: './account-settings.component.html',
  styleUrl: './account-settings.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountSettingsComponent {
  private readonly fb = inject(FormBuilder);
  private readonly loadingService = inject(LoadingService);
  private readonly passwordService = inject(PasswordService);

  form: FormGroup;

  isLoading = this.loadingService.isLoading;
  submitted = signal<boolean>(false);

  constructor() {
    this.form = this.fb.group({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  }

  onSubmitChangePassword() {
    this.submitted.set(true);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const request: ChangePasswordRequest = {
      ...this.form.value,
      logoutBehavior: 0,
    };
    this.passwordService.changePassword(request).subscribe();
  }

  toggleTwoFactor() {}

  passwordMisMatch() {
    return isFormFieldMismatch(this.form);
  }
}
