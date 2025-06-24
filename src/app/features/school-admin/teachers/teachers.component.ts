import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';

import { LeadingZeroPipe } from '../../../shared/pipes/leading-zero.pipe';

import { SearchInputComponent } from '../../../shared/components/search-input/search-input.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { GlobalModalService } from '../../../shared/services/layout/global-modal/global-modal.service';
import { AddTeacherModalComponent } from './add-teacher-modal/add-teacher-modal.component';
import { ImportAccountsComponent } from '../../../shared/components/import-accounts/import-accounts.component';

@Component({
  selector: 'app-teachers',
  standalone: true,
  imports: [
    SearchInputComponent,
    BadgeComponent,
    ButtonComponent,
    TableModule,
    LeadingZeroPipe,
    TooltipModule,
    RouterLink,
    ImportAccountsComponent,
  ],
  templateUrl: './teachers.component.html',
  styleUrl: './teachers.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeachersComponent {
  teachers = [
    {
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
    },
    {
      id: 2,
      name: 'Trần Thị Bích',
      username: 'ttbich',
      avatarUrl: 'https://randomuser.me/api/portraits/women/2.jpg',
      dob: '1985-11-20',
      email: 'ttbich@example.com',
      phoneNumber: '0912345678',
      schoolId: 'SCH002',
      status: 'active',
      createdAt: new Date('2019-08-30'),
      lastModifiedAt: new Date('2023-03-22'),
    },
    {
      id: 3,
      name: 'Lê Minh Cường',
      username: 'lmcuong',
      avatarUrl: 'https://randomuser.me/api/portraits/men/3.jpg',
      dob: '1978-02-28',
      email: 'lmcuong@example.com',
      phoneNumber: '0987654321',
      schoolId: 'SCH003',
      status: 'inactive',
      createdAt: new Date('2018-05-10'),
      lastModifiedAt: new Date('2022-12-15'),
    },
    {
      id: 4,
      name: 'Phạm Thị Dung',
      username: 'ptdung',
      avatarUrl: 'https://randomuser.me/api/portraits/women/4.jpg',
      dob: '1990-07-07',
      email: 'ptdung@example.com',
      phoneNumber: '0909876543',
      schoolId: 'SCH001',
      status: 'active',
      createdAt: new Date('2021-02-20'),
      lastModifiedAt: new Date('2023-01-05'),
    },
    {
      id: 5,
      name: 'Hoàng Văn Em',
      username: 'hvem',
      avatarUrl: 'https://randomuser.me/api/portraits/men/5.jpg',
      dob: '1983-09-09',
      email: 'hvem@example.com',
      phoneNumber: '0911122233',
      schoolId: 'SCH002',
      status: 'active',
      createdAt: new Date('2017-11-11'),
      lastModifiedAt: new Date('2023-02-28'),
    },
    {
      id: 6,
      name: 'Đặng Thị Hương',
      username: 'dthuong',
      avatarUrl: 'https://randomuser.me/api/portraits/women/6.jpg',
      dob: '1987-03-15',
      email: 'dthuong@example.com',
      phoneNumber: '0933445566',
      schoolId: 'SCH003',
      status: 'inactive',
      createdAt: new Date('2016-06-18'),
      lastModifiedAt: new Date('2022-10-10'),
    },
    {
      id: 7,
      name: 'Vũ Minh Giang',
      username: 'vmgiang',
      avatarUrl: 'https://randomuser.me/api/portraits/men/7.jpg',
      dob: '1975-12-01',
      email: 'vmgiang@example.com',
      phoneNumber: '0922334455',
      schoolId: 'SCH001',
      status: 'active',
      createdAt: new Date('2015-04-25'),
      lastModifiedAt: new Date('2023-05-01'),
    },
    {
      id: 8,
      name: 'Lý Thị Hạnh',
      username: 'lthanh',
      avatarUrl: 'https://randomuser.me/api/portraits/women/8.jpg',
      dob: '1992-08-19',
      email: 'lthanh@example.com',
      phoneNumber: '0944556677',
      schoolId: 'SCH002',
      status: 'active',
      createdAt: new Date('2020-09-09'),
      lastModifiedAt: new Date('2023-04-20'),
    },
    {
      id: 9,
      name: 'Trịnh Văn Hùng',
      username: 'tvhung',
      avatarUrl: 'https://randomuser.me/api/portraits/men/9.jpg',
      dob: '1981-06-23',
      email: 'tvhung@example.com',
      phoneNumber: '0905566778',
      schoolId: 'SCH003',
      status: 'inactive',
      createdAt: new Date('2014-12-12'),
      lastModifiedAt: new Date('2022-09-30'),
    },
    {
      id: 10,
      name: 'Phan Thị Kiều',
      username: 'ptkieu',
      avatarUrl: 'https://randomuser.me/api/portraits/women/10.jpg',
      dob: '1986-04-04',
      email: 'ptkieu@example.com',
      phoneNumber: '0912233445',
      schoolId: 'SCH001',
      status: 'active',
      createdAt: new Date('2019-07-07'),
      lastModifiedAt: new Date('2023-03-15'),
    },
    {
      id: 11,
      name: 'Ngô Văn Long',
      username: 'nvlong',
      avatarUrl: 'https://randomuser.me/api/portraits/men/11.jpg',
      dob: '1979-10-10',
      email: 'nvlong@example.com',
      phoneNumber: '0933667788',
      schoolId: 'SCH002',
      status: 'active',
      createdAt: new Date('2018-01-01'),
      lastModifiedAt: new Date('2023-02-02'),
    },
    {
      id: 12,
      name: 'Bùi Thị Mai',
      username: 'btmai',
      avatarUrl: 'https://randomuser.me/api/portraits/women/12.jpg',
      dob: '1991-03-03',
      email: 'btmai@example.com',
      phoneNumber: '0922445566',
      schoolId: 'SCH003',
      status: 'active',
      createdAt: new Date('2021-05-05'),
      lastModifiedAt: new Date('2023-04-04'),
    },
    {
      id: 13,
      name: 'Đỗ Văn Nam',
      username: 'dvnam',
      avatarUrl: 'https://randomuser.me/api/portraits/men/13.jpg',
      dob: '1982-07-07',
      email: 'dvnam@example.com',
      phoneNumber: '0909988776',
      schoolId: 'SCH001',
      status: 'inactive',
      createdAt: new Date('2013-11-11'),
      lastModifiedAt: new Date('2022-08-08'),
    },
    {
      id: 14,
      name: 'Phùng Thị Lan',
      username: 'ptlan',
      avatarUrl: 'https://randomuser.me/api/portraits/women/14.jpg',
      dob: '1988-01-01',
      email: 'ptlan@example.com',
      phoneNumber: '0911776655',
      schoolId: 'SCH002',
      status: 'active',
      createdAt: new Date('2017-03-03'),
      lastModifiedAt: new Date('2023-01-01'),
    },
    {
      id: 15,
      name: 'Trần Văn Quang',
      username: 'tvquang',
      avatarUrl: 'https://randomuser.me/api/portraits/men/15.jpg',
      dob: '1977-09-09',
      email: 'tvquang@example.com',
      phoneNumber: '0933111222',
      schoolId: 'SCH003',
      status: 'active',
      createdAt: new Date('2016-12-12'),
      lastModifiedAt: new Date('2023-05-05'),
    },
  ];
  private readonly globalModalService = inject(GlobalModalService);

  totalRecords = signal<number>(this.teachers.length);
  loading = signal<boolean>(false);
  first = signal<number>(0);
  rows = signal<number>(10);

  get pagedTeachers() {
    return this.teachers.slice(this.first(), this.first() + this.rows());
  }

  loadProductsLazy(event: TableLazyLoadEvent) {}

  onSearchTriggered(term: string) {}

  next() {
    this.first.set(this.first() + this.rows());
  }

  prev() {
    this.first.set(this.first() - this.rows());
  }

  reset() {
    this.first.set(0);
  }

  pageChange(event: any) {
    this.first.set(event.first);
    this.rows.set(event.rows);
  }

  isLastPage(): boolean {
    return this.teachers
      ? this.first() + this.rows() >= this.teachers.length
      : true;
  }

  isFirstPage(): boolean {
    return this.teachers ? this.first() === 0 : true;
  }

  openAddTeacherModal() {
    this.globalModalService.open(AddTeacherModalComponent);
  }
}
