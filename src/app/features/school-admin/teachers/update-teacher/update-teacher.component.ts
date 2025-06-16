import {
  ChangeDetectionStrategy,
  Component,
  input,
  LOCALE_ID,
  signal,
} from '@angular/core';
import { CommonModule, DatePipe, registerLocaleData } from '@angular/common';
import localeVi from '@angular/common/locales/vi';
import { FormsModule, NgForm } from '@angular/forms';
import { FormControlComponent } from '../../../../shared/components/form-control/form-control.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { TooltipModule } from 'primeng/tooltip';

registerLocaleData(localeVi);

@Component({
  selector: 'app-update-teacher',
  standalone: true,
  imports: [
    FormControlComponent,
    FormsModule,
    ButtonComponent,
    CommonModule,
    TooltipModule,
  ],
  templateUrl: './update-teacher.component.html',
  styleUrl: './update-teacher.component.css',
  providers: [DatePipe, { provide: LOCALE_ID, useValue: 'vi' }],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpdateTeacherComponent {
  teacher = {
    id: 1,
    name: 'Nguyễn Văn An',
    username: 'ngvanan',
    avatarUrl: 'https://randomuser.me/api/portraits/men/1.jpg',
    dob: '1980-05-12',
    email: 'ngvanan@example.com',
    phoneNumber: '0901234567',
    schoolId: 'SCH001',
    status: 'active',
    createdAt: new Date('2020-01-15'),
    lastModifiedAt: new Date('2023-04-10'),
  };

  teacherId = input.required<string>();

  name = signal<string>('');
  dob = signal<string>('');
  username = signal<string>('');
  address = signal<string>('');
  email = signal<string>('');
  phoneNumber = signal<string>('');
  avatarUrl = signal<string>('');
  status = signal<string>('');
  createdAt = signal<string>('');
  lastModifiedAt = signal<string>('');

  submitted = signal<boolean>(false);

  statusOptions = [
    { label: 'Hoạt động', value: 'active' },
    { label: 'Ngừng hoạt động', value: 'inactive' },
  ];

  selectedAvatarFile = signal<File | null>(null);
  selectedAvatarUrl = signal<string | null>(null);

  constructor(private readonly datePipe: DatePipe) {}

  formatDateVi(date: Date | string): string {
    return this.datePipe.transform(date, 'medium', undefined, 'vi') ?? '';
  }

  ngOnInit(): void {
    this.name.set(this.teacher.name);
    this.username.set(this.teacher.username);
    this.email.set(this.teacher.email);
    this.dob.set(this.teacher.dob);
    this.phoneNumber.set(this.teacher.phoneNumber);
    this.avatarUrl.set(this.teacher.avatarUrl);
    this.status.set(this.teacher.status);
    this.createdAt.set(this.formatDateVi(new Date(this.teacher.createdAt)));
    this.lastModifiedAt.set(
      this.formatDateVi(new Date(this.teacher.lastModifiedAt))
    );
    this.selectedAvatarFile.set(null);
    this.selectedAvatarUrl.set(null);
  }

  onAvatarChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input?.files?.[0]) {
      const file = input.files[0];
      this.selectedAvatarFile.set(file);
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedAvatarUrl.set(e.target.result);
      };
      reader.readAsDataURL(file);
      input.value = '';
    }
  }

  removeSelectedAvatar() {
    this.selectedAvatarFile.set(null);
    this.selectedAvatarUrl.set(null);
  }

  onSubmit(form: NgForm) {
    this.submitted.set(true);
    if (form.invalid) {
      Object.values(form.controls).forEach(control => control.markAsTouched());
      return;
    }
    // Submit logic
    const avatarFile = this.selectedAvatarFile();
    if (avatarFile) {
      // Handle logic if an avatar file is selected
    }
  }
}
