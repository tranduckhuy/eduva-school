import {
  ChangeDetectionStrategy,
  Component,
  input,
  signal,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

import { TooltipModule } from 'primeng/tooltip';

import { FormControlComponent } from '../../../../shared/components/form-control/form-control.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

@Component({
  selector: 'app-update-student',
  standalone: true,
  imports: [
    FormControlComponent,
    FormsModule,
    ButtonComponent,
    CommonModule,
    TooltipModule,
  ],
  templateUrl: './update-student.component.html',
  styleUrl: './update-student.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpdateStudentComponent {
  student = {
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

  studentId = input.required<string>();

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
    this.name.set(this.student.name);
    this.username.set(this.student.username);
    this.email.set(this.student.email);
    this.dob.set(this.student.dob);
    this.phoneNumber.set(this.student.phoneNumber);
    this.avatarUrl.set(this.student.avatarUrl);
    this.status.set(this.student.status);
    this.createdAt.set(this.formatDateVi(new Date(this.student.createdAt)));
    if (this.student.lastModifiedAt) {
      this.lastModifiedAt.set(
        this.formatDateVi(new Date(this.student.lastModifiedAt))
      );
    }
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
