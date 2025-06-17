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

registerLocaleData(localeVi);

@Component({
  selector: 'app-teacher',
  standalone: true,
  imports: [FormControlComponent, FormsModule],
  templateUrl: './teacher.component.html',
  styleUrl: './teacher.component.css',
  providers: [DatePipe, { provide: LOCALE_ID, useValue: 'vi' }],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeacherComponent {
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

  constructor(private readonly datePipe: DatePipe) {}

  formatDateVi(date: Date | string): string {
    return this.datePipe.transform(date, 'medium', undefined, 'vi') ?? '';
  }

  ngOnInit(): void {
    this.name.set(this.teacher.name);
    this.username.set(this.teacher.username);
    this.email.set(this.teacher.email);
    this.teacher.dob && this.dob.set(this.teacher.dob);
    this.phoneNumber.set(this.teacher.phoneNumber);
    this.avatarUrl.set(this.teacher.avatarUrl);
    this.status.set(
      this.teacher.status === 'active' ? 'Đang hoạt động' : 'Vô hiệu hóa'
    );
    this.createdAt.set(this.formatDateVi(new Date(this.teacher.createdAt!)));
    if (this.teacher.lastModifiedAt) {
      this.lastModifiedAt.set(
        this.formatDateVi(new Date(this.teacher.lastModifiedAt))
      );
    }
  }
}
