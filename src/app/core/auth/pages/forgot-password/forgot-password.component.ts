import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

import { ButtonModule } from 'primeng/button';

import { LoadingService } from '../../../../shared/services/core/loading/loading.service';
import { PasswordService } from '../../services/password.service';
import { UserService } from '../../../../shared/services/api/user/user.service';

import { AuthLayoutComponent } from '../../auth-layout/auth-layout.component';
import { FormControlComponent } from '../../../../shared/components/form-control/form-control.component';

import { type EmailLinkRequest } from '../../models/request/email-link-request.model';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    AuthLayoutComponent,
    FormControlComponent,
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly loadingService = inject(LoadingService);
  private readonly passwordService = inject(PasswordService);
  private readonly userService = inject(UserService);

  form: FormGroup;

  isLoading = this.loadingService.isLoading;
  currentUser = this.userService.currentUser;
  submitted = signal<boolean>(false);

  constructor() {
    this.form = this.fb.group({
      email: this.currentUser() ? this.currentUser()?.email : '',
    });
  }

  onSubmit(): void {
    this.submitted.set(true);
    this.form.markAllAsTouched();

    if (this.form.invalid) return;

    const request: EmailLinkRequest = this.form.value;

    this.passwordService.forgotPassword(request).subscribe(this.form.reset);
  }
}
