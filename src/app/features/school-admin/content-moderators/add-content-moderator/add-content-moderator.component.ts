import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  Inject,
  Optional,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { ButtonModule } from 'primeng/button';

import { GlobalModalService } from '../../../../shared/services/layout/global-modal/global-modal.service';
import { LoadingService } from '../../../../shared/services/core/loading/loading.service';
import { UserService } from '../../../../shared/services/api/user/user.service';

import { Role } from '../../../../shared/models/enum/role.enum';
import { MODAL_DATA } from '../../../../shared/tokens/injection/modal-data.token';

import { isFormFieldMismatch } from '../../../../shared/utils/util-functions';
import {
  customEmailValidator,
  strongPasswordValidator,
} from '../../../../shared/utils/form-validators';

import { FormControlComponent } from '../../../../shared/components/form-control/form-control.component';

import { type CreateUserRequest } from '../../../../shared/models/api/request/command/create-user-request.model';

@Component({
  selector: 'app-add-content-moderator',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    FormControlComponent,
  ],
  templateUrl: './add-content-moderator.component.html',
  styleUrl: './add-content-moderator.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddContentModeratorComponent {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly loadingService = inject(LoadingService);
  private readonly globalModalService = inject(GlobalModalService);
  private readonly data = inject(MODAL_DATA, { optional: true });

  readonly isLoading = this.loadingService.is('create-user');

  form: FormGroup;

  // signal
  submitted = signal<boolean>(false);
  passwordLevel = signal<number | undefined>(undefined);

  constructor() {
    this.form = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, customEmailValidator]],
      initialPassword: ['', [Validators.required, strongPasswordValidator]],
      confirmPassword: ['', Validators.required],
    });
  }

  get passwordMisMatch() {
    return isFormFieldMismatch(this.form, 'initialPassword');
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
      role: Role.ContentModerator,
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
