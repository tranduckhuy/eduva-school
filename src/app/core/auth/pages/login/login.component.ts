import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { AuthService } from '../../services/auth.service';

import { AuthLayoutComponent } from '../../auth-layout/auth-layout.component';

import { FormControlComponent } from '../../../../shared/components/form-control/form-control.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

import { type LoginRequest } from './models/login-request.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    AuthLayoutComponent,
    FormControlComponent,
    ButtonComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  form!: FormGroup;

  submitted = signal<boolean>(false);

  constructor() {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
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
