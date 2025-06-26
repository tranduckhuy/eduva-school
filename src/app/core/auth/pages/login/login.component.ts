import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';

import { LoadingService } from '../../../../shared/services/core/loading/loading.service';
import { AuthService } from '../../services/auth.service';
import { EmailVerificationService } from '../../services/email-verification.service';

import { AuthLayoutComponent } from '../../auth-layout/auth-layout.component';

import { FormControlComponent } from '../../../../shared/components/form-control/form-control.component';

import { type LoginRequest } from './models/login-request.model';
import { ConfirmEmailRequest } from '../../models/request/confirm-email-request.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    AuthLayoutComponent,
    FormControlComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly loadingService = inject(LoadingService);
  private readonly authService = inject(AuthService);
  private readonly emailVerificationService = inject(EmailVerificationService);

  form: FormGroup;

  isLoading = this.loadingService.isLoading;
  submitted = signal<boolean>(false);

  constructor() {
    this.form = this.fb.group({
      email: '',
      password: '',
    });
  }

  ngOnInit(): void {
    this.activatedRoute.queryParamMap.subscribe(params => {
      const token = params.get('token');
      const email = params.get('email');

      if (token && email) {
        const request: ConfirmEmailRequest = { token, email };
        this.emailVerificationService.confirmEmail(request).subscribe();
      }
    });
  }

  onSubmit(): void {
    this.submitted.set(true);
    this.form.markAllAsTouched();

    if (this.form.invalid) return;

    const request: LoginRequest = this.form.value;

    this.authService.login(request).subscribe();
  }
}
