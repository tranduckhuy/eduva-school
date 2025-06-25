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
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { FormControlComponent } from '../../../components/form-control/form-control.component';
import { UserService } from '../../../services/api/user/user.service';
import { User } from '../../../models/entities/user.model';

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

  form: FormGroup;
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
      avatarUrl: user.avatarUrl,
      phoneNumber: user.phoneNumber,
      fullName: user.fullName,
      firstName,
      lastName,
    };

    this.form.patchValue({
      avatar: user.avatarUrl,
      firstName,
      lastName,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
    });

    this.syncFullName();
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
      avatarUrl: avatar, // Avatar là URL (đã xử lý từ file)
    };

    // this.userService.updateProfile(payload).subscribe(...)

    // update local backup
    const { firstName, lastName } = this.splitFullName(fullName);
    this.originalUserData = { ...payload, firstName, lastName };
    this.isEdit.set(false);
  }

  onAvatarChange(event: Event) {
    const file = (event.target as HTMLInputElement)?.files?.[0];
    if (!file) return;

    // 👇 Thay thế bằng upload thực tế nếu cần (Firebase, CDN...)
    const fakeUploadedUrl = URL.createObjectURL(file); // demo giả lập URL

    this.form.patchValue({ avatar: fakeUploadedUrl });
  }
}
