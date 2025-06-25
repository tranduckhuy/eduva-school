import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { startWith } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ButtonModule } from 'primeng/button';

import { UserService } from '../../../services/api/user/user.service';
import { LoadingService } from '../../../services/core/loading/loading.service';
import { GlobalModalService } from '../../../services/layout/global-modal/global-modal.service';
import { ToastHandlingService } from '../../../services/core/toast/toast-handling.service';

import { FormControlComponent } from '../../../components/form-control/form-control.component';
import { UpdateAvatarModalComponent } from './update-avatar-modal/update-avatar-modal.component';

import { type User } from '../../../models/entities/user.model';

@Component({
  selector: 'app-personal-information',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, FormControlComponent],
  templateUrl: './personal-information.component.html',
  styleUrl: './personal-information.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PersonalInformationComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly userService = inject(UserService);
  private readonly loadingService = inject(LoadingService);
  private readonly globalModalService = inject(GlobalModalService);
  private readonly toastHandlingService = inject(ToastHandlingService);

  form: FormGroup;

  isLoading = this.loadingService.isLoading;
  isEdit = signal(false);

  user = this.userService.currentUser;
  originalUserData!: Partial<User> & { firstName: string; lastName: string };

  constructor() {
    this.form = this.fb.group({
      avatar: [''],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      fullName: [''],
      phoneNumber: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    const user = this.user();
    if (!user) return;

    const { firstName, lastName } = this.splitFullName(user.fullName);

    this.originalUserData = {
      phoneNumber: user.phoneNumber,
      fullName: user.fullName,
      firstName,
      lastName,
    };

    this.form.patchValue({
      firstName,
      lastName,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
    });

    this.syncFullName();
  }

  enableEdit() {
    this.isEdit.set(true);
  }

  cancelEdit() {
    this.form.patchValue({
      avatar: this.originalUserData.avatarUrl,
      firstName: this.originalUserData.firstName,
      lastName: this.originalUserData.lastName,
      fullName: this.originalUserData.fullName,
      phoneNumber: this.originalUserData.phoneNumber,
    });
    this.form.markAsPristine();
    this.isEdit.set(false);
  }

  onSubmit() {
    if (this.form.invalid) return;

    const { fullName, phoneNumber, avatar } = this.form.value;

    const payload = {
      fullName,
      phoneNumber,
      avatarUrl: avatar,
    };

    this.userService.updateUserProfile(payload).subscribe(user => {
      if (user) {
        console.log(user);
        console.log(user.fullName);
        const { firstName, lastName } = this.splitFullName(user.fullName);
        console.log(firstName);
        console.log(lastName);
        this.originalUserData = { ...payload, firstName, lastName };
        this.isEdit.set(false);
      }
    });
  }

  openAvatarModal() {
    this.globalModalService.open(UpdateAvatarModalComponent, {
      fullname: this.user()?.fullName,
      avatarUrl: this.user()?.avatarUrl,
      onComplete: (newAvatarUrl: string) => {
        if (!newAvatarUrl) {
          this.toastHandlingService.errorGeneral();
          return;
        }

        this.form.patchValue({ avatar: newAvatarUrl });
        this.onSubmit();
      },
    });
  }

  private syncFullName() {
    this.form.valueChanges
      .pipe(startWith(this.form.value), takeUntilDestroyed(this.destroyRef))
      .subscribe(({ firstName, lastName }) => {
        const fullName = `${firstName} ${lastName}`.trim();
        this.form.get('fullName')?.setValue(fullName, { emitEvent: false });
      });
  }

  private splitFullName(fullName: string) {
    const parts = fullName.trim().split(/\s+/);
    const lastName = parts.pop() ?? '';
    const firstName = parts.join(' ');
    return { firstName, lastName };
  }
}
