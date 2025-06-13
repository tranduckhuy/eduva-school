import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { AuthLayoutComponent } from '../../auth-layout/auth-layout.component';
import { FormControlComponent } from '../../../../shared/components/form-control/form-control.component';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    AuthLayoutComponent,
    FormControlComponent,
    FormsModule,
    ButtonComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  email = signal<string>('');
  password = signal<string>('');

  onSubmit() {}
}
