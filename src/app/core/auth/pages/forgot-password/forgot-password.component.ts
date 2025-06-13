import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { AuthLayoutComponent } from '../../auth-layout/auth-layout.component';
import { FormControlComponent } from '../../../../shared/components/form-control/form-control.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    AuthLayoutComponent,
    FormControlComponent,
    ButtonComponent,
    FormsModule,
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPasswordComponent {
  email = signal<string>('');

  onSubmit() {}
}
