import {
  ChangeDetectionStrategy,
  Component,
  input,
  LOCALE_ID,
  OnInit,
  signal,
} from '@angular/core';
import { FormControlComponent } from '../../../../shared/components/form-control/form-control.component';
import { FormsModule } from '@angular/forms';
import { DatePipe, registerLocaleData } from '@angular/common';
import localeVi from '@angular/common/locales/vi';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { RouterLink } from '@angular/router';

const school = {
  id: 1,
  name: 'Trường Tiểu học Nguyễn Văn Trỗi',
  code: 'THNVTR01',
  address: '123 Đường Lý Thường Kiệt, Quận 10, TP. Hồ Chí Minh',
  contactEmail: 'contact@thnguyenvantroithi.edu.vn',
  phoneNumber: '028-38451234',
  websiteUrl: 'https://thnguyenvantroithi.edu.vn',
  status: 'active',
  createdAt: '2022-01-10T08:30:00',
  createdBy: 'admin',
  lastModifiedAt: '2023-02-15T10:00:00',
  lastModifiedBy: 'admin',
};

registerLocaleData(localeVi);

@Component({
  selector: 'app-school',
  standalone: true,
  imports: [FormControlComponent, FormsModule, ButtonComponent, RouterLink],
  templateUrl: './school.component.html',
  styleUrl: './school.component.css',
  providers: [DatePipe, { provide: LOCALE_ID, useValue: 'vi' }],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SchoolComponent implements OnInit {
  schoolId = input.required<string>();

  name = signal<string>('');
  code = signal<string>('');
  address = signal<string>('');
  contactEmail = signal<string>('');
  phoneNumber = signal<string>('');
  websiteUrl = signal<string>('');
  status = signal<string>('');
  createdAt = signal<string>('');
  lastModifiedAt = signal<string>('');

  schoolAdminName = signal<string>('Nguyễn Văn A');
  schoolAdminEmail = signal<string>('nguyenvana@gmail.com');

  constructor(private datePipe: DatePipe) {}

  formatDateVi(date: Date | string): string {
    return this.datePipe.transform(date, 'medium', undefined, 'vi') || '';
  }

  ngOnInit(): void {
    this.name.set(school.name);
    this.code.set(school.code);
    this.contactEmail.set(school.contactEmail);
    this.address.set(school.address);
    this.phoneNumber.set(school.phoneNumber);
    this.websiteUrl.set(school.websiteUrl);
    this.status.set(
      school.status === 'active' ? 'Đang hoạt động' : 'Vô hiệu hóa'
    );
    this.createdAt.set(this.formatDateVi(new Date(school.createdAt)));
    this.lastModifiedAt.set(this.formatDateVi(new Date(school.lastModifiedAt)));
  }
}
