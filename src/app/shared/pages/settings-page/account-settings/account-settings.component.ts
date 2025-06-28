import {
  ChangeDetectionStrategy,
  Component,
  inject,
  computed,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';

import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';

import { LoadingService } from '../../../services/core/loading/loading.service';
import { GlobalModalService } from '../../../services/layout/global-modal/global-modal.service';
import { PasswordService } from '../../../../core/auth/services/password.service';
import { UserService } from '../../../services/api/user/user.service';

import { isFormFieldMismatch } from '../../../utils/util-functions';

import { FormControlComponent } from '../../../components/form-control/form-control.component';
import { PasswordModalComponent } from './password-modal/password-modal.component';

import { type ChangePasswordRequest } from '../../../models/api/request/command/change-password-request.model';

@Component({
  selector: 'app-account-settings',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ToggleSwitchModule,
    CheckboxModule,
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
  private readonly globalModalService = inject(GlobalModalService);
  private readonly userService = inject(UserService);
  private readonly passwordService = inject(PasswordService);

  form: FormGroup;

  isLoading = this.loadingService.is('change-password-form');
  readonly user = this.userService.currentUser;

  twoFactorEnabled = computed(() => this.user()?.is2FAEnabled ?? false);

  submitted = signal<boolean>(false);

  constructor() {
    this.form = this.fb.group({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      logoutBehavior: 0,
    });
  }

  get passwordMisMatch() {
    return isFormFieldMismatch(this.form);
  }

  onSubmitChangePassword() {
    this.submitted.set(true);
    this.form.markAllAsTouched();

    if (this.form.invalid) return;

    const request: ChangePasswordRequest = this.form.value;
    this.passwordService.changePassword(request).subscribe();
  }

  openPasswordModal() {
    this.globalModalService.open(PasswordModalComponent, {
      enabled: this.twoFactorEnabled(),
    });
  }
}
