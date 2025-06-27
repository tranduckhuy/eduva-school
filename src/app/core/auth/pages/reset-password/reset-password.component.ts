import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';

import { ButtonModule } from 'primeng/button';

import { LoadingService } from '../../../../shared/services/core/loading/loading.service';
import { PasswordService } from '../../services/password.service';

import { AuthLayoutComponent } from '../../auth-layout/auth-layout.component';
import { FormControlComponent } from '../../../../shared/components/form-control/form-control.component';

import { isFormFieldMismatch } from '../../../../shared/utils/util-functions';

import { type ResetPasswordRequest } from './models/reset-password-request.model';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    AuthLayoutComponent,
    FormControlComponent,
    RouterLink,
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPasswordComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly loadingService = inject(LoadingService);
  private readonly passwordService = inject(PasswordService);

  form: FormGroup;

  isLoading = this.loadingService.isLoading;
  email = signal<string>('');
  token = signal<string>('');
  submitted = signal<boolean>(false);

  constructor() {
    this.form = this.fb.group({
      password: '',
      confirmPassword: '',
    });
  }

  ngOnInit(): void {
    const params = this.activatedRoute.snapshot.queryParamMap;
    this.token.set(params.get('token') ?? '');
    this.email.set(params.get('email') ?? '');
  }

  get passwordMisMatch() {
    return isFormFieldMismatch(this.form, 'password');
  }

  onSubmit(): void {
    this.submitted.set(true);
    this.form.markAllAsTouched();

    if (this.form.invalid) return;

    const request: ResetPasswordRequest = {
      email: this.email(),
      token: this.token(),
      ...this.form.value,
    };
    this.passwordService
      .resetPassword(request)
      .subscribe(() => this.router.navigateByUrl('/auth/login'));
  }
}
