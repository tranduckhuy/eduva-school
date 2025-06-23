import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';

import { LoadingService } from '../../../../shared/services/core/loading/loading.service';
import { AuthService } from '../../services/auth.service';

import { AuthLayoutComponent } from '../../auth-layout/auth-layout.component';

import { FormControlComponent } from '../../../../shared/components/form-control/form-control.component';

import { type LoginRequest } from './models/login-request.model';

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
export class LoginComponent {
  private readonly loadingService = inject(LoadingService);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  form: FormGroup;

  isLoading = this.loadingService.isLoading;
  submitted = signal<boolean>(false);

  constructor() {
    this.form = this.fb.group({
      email: '',
      password: '',
    });
  }

  onSubmit(): void {
    this.submitted.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const request: LoginRequest = this.form.value;

    this.authService.login(request).subscribe();
  }
}
