import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  inject,
  Optional,
  signal,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

import { ButtonModule } from 'primeng/button';

import { GlobalModalService } from '../../../../shared/services/layout/global-modal/global-modal.service';
import { FormControlComponent } from '../../../../shared/components/form-control/form-control.component';
import { LoadingService } from '../../../../shared/services/core/loading/loading.service';
import { UserService } from '../../../../shared/services/api/user/user.service';
import { MODAL_DATA } from '../../../../shared/tokens/injection/modal-data.token';
import { CreateUserRequest } from '../../../../shared/models/api/request/command/create-user-request.model';
import { Role } from '../../../../shared/models/enum/role.enum';

@Component({
  selector: 'app-add-teacher-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    FormControlComponent,
  ],
  templateUrl: './add-teacher-modal.component.html',
  styleUrl: './add-teacher-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddTeacherModalComponent {
  private readonly fb = inject(FormBuilder);
  private readonly globalModalService = inject(GlobalModalService);
  private readonly loadingService = inject(LoadingService);
  private readonly userService = inject(UserService);

  readonly isLoading = this.loadingService.is('create-user');

  form: FormGroup;

  // signal
  submitted = signal<boolean>(false);
  passwordLevel = signal<number | undefined>(undefined);

  constructor(@Optional() @Inject(MODAL_DATA) private readonly data: any) {
    this.form = this.fb.group({
      fullName: [''],
      email: [''],
      initialPassword: [''],
      confirmPassword: [''],
    });

    this.form
      .get('initialPassword')!
      .valueChanges.subscribe((password: string) => {
        this.passwordLevel.set(this.calcPasswordLevel(password));
      });
  }

  private calcPasswordLevel(password: string): number | undefined {
    if (!password) return undefined;
    let level = 0;
    if (password.length >= 6) level++;
    if (/[a-z]/.test(password)) level++;
    if (/[A-Z]/.test(password)) level++;
    if (/\d/.test(password)) level++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) level++;
    return level;
  }

  // function
  onSubmit() {
    this.submitted.set(true);
    this.form.markAllAsTouched();

    if (this.form.invalid) return;

    const createUserRequest: CreateUserRequest = {
      email: this.form.value.email,
      fullName: this.form.value.fullName,
      initialPassword: this.form.value.initialPassword,
      role: Role.Teacher,
    };

    this.userService.createUser(createUserRequest).subscribe(success => {
      if (success) {
        if (this.data && typeof this.data.onSuccess === 'function') {
          this.data.onSuccess();
        }
        this.closeModal();
      }
    });
  }

  closeModal() {
    this.globalModalService.close();
  }
}
