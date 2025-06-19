import {
  ChangeDetectionStrategy,
  Component,
  input,
  LOCALE_ID,
  signal,
} from '@angular/core';
import { DatePipe, registerLocaleData } from '@angular/common';
import localeVi from '@angular/common/locales/vi';
import { FormsModule } from '@angular/forms';
import { FormControlComponent } from '../../../../shared/components/form-control/form-control.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { RouterLink } from '@angular/router';

registerLocaleData(localeVi);

@Component({
  selector: 'app-student',
  standalone: true,
  imports: [FormControlComponent, FormsModule, ButtonComponent, RouterLink],
  templateUrl: './student.component.html',
  styleUrl: './student.component.css',
  providers: [DatePipe, { provide: LOCALE_ID, useValue: 'vi' }],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentComponent {
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

  constructor(private readonly datePipe: DatePipe) {}

  formatDateVi(date: Date | string): string {
    return this.datePipe.transform(date, 'medium', undefined, 'vi') ?? '';
  }

  ngOnInit(): void {
    this.name.set(this.student.name);
    this.username.set(this.student.username);
    this.email.set(this.student.email);
    this.student.dob && this.dob.set(this.student.dob);
    this.phoneNumber.set(this.student.phoneNumber);
    this.avatarUrl.set(this.student.avatarUrl);
    this.status.set(
      this.student.status === 'active' ? 'Đang hoạt động' : 'Vô hiệu hóa'
    );
    this.createdAt.set(this.formatDateVi(new Date(this.student.createdAt!)));
    if (this.student.lastModifiedAt) {
      this.lastModifiedAt.set(
        this.formatDateVi(new Date(this.student.lastModifiedAt))
      );
    }
  }
}
