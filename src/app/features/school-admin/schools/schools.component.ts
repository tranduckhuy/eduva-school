import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  signal,
} from '@angular/core';
import { SearchInputComponent } from '../../../shared/components/search-input/search-input.component';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { School } from '../../../shared/models/school/school.model';
import { LeadingZeroPipe } from '../../../shared/pipes/leading-zero.pipe';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { TooltipModule } from 'primeng/tooltip';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-schools',
  standalone: true,
  imports: [
    SearchInputComponent,
    TableModule,
    LeadingZeroPipe,
    BadgeComponent,
    ButtonComponent,
    TooltipModule,
    RouterLink,
  ],
  templateUrl: './schools.component.html',
  styleUrl: './schools.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SchoolsComponent implements OnInit {
  schools: School[] = [
    {
      id: 1,
      name: 'Trường Tiểu học Nguyễn Văn Trỗi',
      code: 'THNVTR01',
      address: '123 Đường Lý Thường Kiệt, Quận 10, TP. Hồ Chí Minh',
      contactEmail: 'contact@thnguyenvantroithi.edu.vn',
      phoneNumber: '028-38451234',
      websiteUrl: 'https://thnguyenvantroithi.edu.vn',
      status: 'active',
      createdAt: new Date('2022-01-10T08:30:00'),
      createdBy: 'admin',
      lastModifiedAt: new Date('2023-02-15T10:00:00'),
      lastModifiedBy: 'admin',
    },
    {
      id: 2,
      name: 'Trường Trung học Cơ sở Lê Quý Đôn',
      code: 'THCSLQD02',
      address: '456 Đường Nguyễn Trãi, Quận 5, TP. Hồ Chí Minh',
      contactEmail: 'info@thcslequydon.edu.vn',
      phoneNumber: '028-39204567',
      websiteUrl: 'https://thcslequydon.edu.vn',
      status: 'active',
      createdAt: new Date('2021-05-20T09:00:00'),
      createdBy: 'admin',
      lastModifiedAt: new Date('2023-03-01T11:15:00'),
      lastModifiedBy: 'admin',
    },
    {
      id: 3,
      name: 'Trường Trung học Phổ thông Nguyễn Huệ',
      code: 'THPTNH03',
      address: '789 Đường Trần Hưng Đạo, Quận 1, TP. Hồ Chí Minh',
      contactEmail: 'contact@thptnguyenhue.edu.vn',
      phoneNumber: '028-38223344',
      websiteUrl: 'https://thptnguyenhue.edu.vn',
      status: 'active',
      createdAt: new Date('2020-08-15T07:45:00'),
      createdBy: 'admin',
      lastModifiedAt: new Date('2023-01-10T09:30:00'),
      lastModifiedBy: 'admin',
    },
    {
      id: 4,
      name: 'Trường Mầm non Hoa Mai',
      code: 'MNHOAMAI04',
      address: '321 Đường Phan Đình Phùng, Quận Phú Nhuận, TP. Hồ Chí Minh',
      contactEmail: 'info@mnhoamai.edu.vn',
      phoneNumber: '028-39998877',
      websiteUrl: 'https://mnhoamai.edu.vn',
      status: 'active',
      createdAt: new Date('2022-03-05T08:00:00'),
      createdBy: 'admin',
      lastModifiedAt: new Date('2023-04-20T10:45:00'),
      lastModifiedBy: 'admin',
    },
    {
      id: 5,
      name: 'Trường Tiểu học Trần Phú',
      code: 'THTP05',
      address: '654 Đường Lê Lợi, Quận 3, TP. Hồ Chí Minh',
      contactEmail: 'contact@thtranphu.edu.vn',
      phoneNumber: '028-38334455',
      websiteUrl: 'https://thtranphu.edu.vn',
      status: 'inactive',
      createdAt: new Date('2019-11-12T08:20:00'),
      createdBy: 'admin',
      lastModifiedAt: new Date('2021-12-01T09:00:00'),
      lastModifiedBy: 'admin',
    },
    {
      id: 6,
      name: 'Trường Trung học Cơ sở Phan Bội Châu',
      code: 'THCSPBC06',
      address: '987 Đường Cách Mạng Tháng Tám, Quận Tân Bình, TP. Hồ Chí Minh',
      contactEmail: 'info@thcsphanboichau.edu.vn',
      phoneNumber: '028-37654321',
      websiteUrl: 'https://thcsphanboichau.edu.vn',
      status: 'active',
      createdAt: new Date('2021-07-22T07:30:00'),
      createdBy: 'admin',
      lastModifiedAt: new Date('2023-05-01T08:45:00'),
      lastModifiedBy: 'admin',
    },
    {
      id: 7,
      name: 'Trường Trung học Phổ thông Trưng Vương',
      code: 'THPTTV07',
      address: '159 Đường Võ Văn Tần, Quận 3, TP. Hồ Chí Minh',
      contactEmail: 'contact@thpttrungvuong.edu.vn',
      phoneNumber: '028-38332211',
      websiteUrl: 'https://thpttrungvuong.edu.vn',
      status: 'active',
      createdAt: new Date('2020-10-10T09:15:00'),
      createdBy: 'admin',
      lastModifiedAt: new Date('2023-02-25T10:00:00'),
      lastModifiedBy: 'admin',
    },
    {
      id: 8,
      name: 'Trường Mầm non Sao Mai',
      code: 'MNSAO08',
      address: '753 Đường Nguyễn Văn Cừ, Quận 5, TP. Hồ Chí Minh',
      contactEmail: 'info@mnsao.edu.vn',
      phoneNumber: '028-39557788',
      websiteUrl: 'https://mnsao.edu.vn',
      status: 'inactive',
      createdAt: new Date('2019-09-05T08:30:00'),
      createdBy: 'admin',
      lastModifiedAt: new Date('2022-11-15T09:45:00'),
      lastModifiedBy: 'admin',
    },
    {
      id: 9,
      name: 'Trường Tiểu học Lê Lợi',
      code: 'THLL09',
      address: '852 Đường Hai Bà Trưng, Quận 1, TP. Hồ Chí Minh',
      contactEmail: 'contact@thleloi.edu.vn',
      phoneNumber: '028-38221133',
      websiteUrl: 'https://thleloi.edu.vn',
      status: 'active',
      createdAt: new Date('2021-01-20T07:50:00'),
      createdBy: 'admin',
      lastModifiedAt: new Date('2023-04-10T08:30:00'),
      lastModifiedBy: 'admin',
    },
    {
      id: 10,
      name: 'Trường Trung học Cơ sở Nguyễn Du',
      code: 'THCSND10',
      address: '951 Đường Trần Quang Khải, Quận 1, TP. Hồ Chí Minh',
      contactEmail: 'info@thcsnguyendu.edu.vn',
      phoneNumber: '028-38334466',
      websiteUrl: 'https://thcsnguyendu.edu.vn',
      status: 'active',
      createdAt: new Date('2020-06-15T08:10:00'),
      createdBy: 'admin',
      lastModifiedAt: new Date('2023-03-20T09:00:00'),
      lastModifiedBy: 'admin',
    },
    {
      id: 11,
      name: 'Trường Trung học Phổ thông Bùi Thị Xuân',
      code: 'THPTBTX11',
      address: '357 Đường Nguyễn Đình Chiểu, Quận 3, TP. Hồ Chí Minh',
      contactEmail: 'contact@thptbuithixuan.edu.vn',
      phoneNumber: '028-38335577',
      websiteUrl: 'https://thptbuithixuan.edu.vn',
      status: 'active',
      createdAt: new Date('2021-04-01T07:40:00'),
      createdBy: 'admin',
      lastModifiedAt: new Date('2023-05-05T08:20:00'),
      lastModifiedBy: 'admin',
    },
    {
      id: 12,
      name: 'Trường Mầm non Bình Minh',
      code: 'MNBINHMINH12',
      address: '258 Đường Lê Hồng Phong, Quận 10, TP. Hồ Chí Minh',
      contactEmail: 'info@mnbinhminh.edu.vn',
      phoneNumber: '028-38445566',
      websiteUrl: 'https://mnbinhminh.edu.vn',
      status: 'active',
      createdAt: new Date('2022-02-18T08:25:00'),
      createdBy: 'admin',
      lastModifiedAt: new Date('2023-04-15T09:10:00'),
      lastModifiedBy: 'admin',
    },
    {
      id: 13,
      name: 'Trường Tiểu học Trần Hưng Đạo',
      code: 'THTHD13',
      address: '147 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
      contactEmail: 'contact@thtranphungdao.edu.vn',
      phoneNumber: '028-38224455',
      websiteUrl: 'https://thtranphungdao.edu.vn',
      status: 'inactive',
      createdAt: new Date('2018-12-10T08:00:00'),
      createdBy: 'admin',
      lastModifiedAt: new Date('2021-01-15T09:30:00'),
      lastModifiedBy: 'admin',
    },
    {
      id: 14,
      name: 'Trường Trung học Cơ sở Lý Thường Kiệt',
      code: 'THCSLTK14',
      address: '369 Đường Trần Phú, Quận 5, TP. Hồ Chí Minh',
      contactEmail: 'info@thcslythuongkiet.edu.vn',
      phoneNumber: '028-39336677',
      websiteUrl: 'https://thcslythuongkiet.edu.vn',
      status: 'active',
      createdAt: new Date('2021-09-25T07:55:00'),
      createdBy: 'admin',
      lastModifiedAt: new Date('2023-02-28T08:40:00'),
      lastModifiedBy: 'admin',
    },
    {
      id: 15,
      name: 'Trường Trung học Phổ thông Phan Chu Trinh',
      code: 'THPTPCT15',
      address: '753 Đường Nguyễn Trãi, Quận 10, TP. Hồ Chí Minh',
      contactEmail: 'contact@thptphanchutrinh.edu.vn',
      phoneNumber: '028-38447788',
      websiteUrl: 'https://thptphanchutrinh.edu.vn',
      status: 'active',
      createdAt: new Date('2020-11-30T08:15:00'),
      createdBy: 'admin',
      lastModifiedAt: new Date('2023-04-05T09:00:00'),
      lastModifiedBy: 'admin',
    },
    {
      id: 16,
      name: 'Trường Mầm non Hoa Sen',
      code: 'MNHS16',
      address: '852 Đường Lê Văn Sỹ, Quận Phú Nhuận, TP. Hồ Chí Minh',
      contactEmail: 'info@mnhoasen.edu.vn',
      phoneNumber: '028-39990011',
      websiteUrl: 'https://mnhoasen.edu.vn',
      status: 'active',
      createdAt: new Date('2022-04-12T08:35:00'),
      createdBy: 'admin',
      lastModifiedAt: new Date('2023-05-10T10:10:00'),
      lastModifiedBy: 'admin',
    },
    {
      id: 17,
      name: 'Trường Tiểu học Võ Thị Sáu',
      code: 'THVTS17',
      address: '951 Đường Cách Mạng Tháng 8, Quận 3, TP. Hồ Chí Minh',
      contactEmail: 'contact@thvothisau.edu.vn',
      phoneNumber: '028-38338899',
      websiteUrl: 'https://thvothisau.edu.vn',
      status: 'active',
      createdAt: new Date('2019-07-18T07:50:00'),
      createdBy: 'admin',
      lastModifiedAt: new Date('2022-10-20T08:30:00'),
      lastModifiedBy: 'admin',
    },
    {
      id: 18,
      name: 'Trường Trung học Cơ sở Trần Phú',
      code: 'THCSTP18',
      address: '357 Đường Nguyễn Văn Trỗi, Quận Phú Nhuận, TP. Hồ Chí Minh',
      contactEmail: 'info@thcstranphu.edu.vn',
      phoneNumber: '028-39991122',
      websiteUrl: 'https://thcstranphu.edu.vn',
      status: 'inactive',
      createdAt: new Date('2020-03-22T08:05:00'),
      createdBy: 'admin',
      lastModifiedAt: new Date('2021-06-15T09:20:00'),
      lastModifiedBy: 'admin',
    },
    {
      id: 19,
      name: 'Trường Trung học Phổ thông Nguyễn Trãi',
      code: 'THPTNT19',
      address: '258 Đường Lý Chính Thắng, Quận 3, TP. Hồ Chí Minh',
      contactEmail: 'contact@thptnguyentrai.edu.vn',
      phoneNumber: '028-38331144',
      websiteUrl: 'https://thptnguyentrai.edu.vn',
      status: 'active',
      createdAt: new Date('2021-12-05T07:45:00'),
      createdBy: 'admin',
      lastModifiedAt: new Date('2023-01-20T08:55:00'),
      lastModifiedBy: 'admin',
    },
    {
      id: 20,
      name: 'Trường Mầm non Bình An',
      code: 'MNBINHAN20',
      address: '147 Đường Trần Văn Đang, Quận 3, TP. Hồ Chí Minh',
      contactEmail: 'info@mnbinhan.edu.vn',
      phoneNumber: '028-38330077',
      websiteUrl: 'https://mnbinhan.edu.vn',
      status: 'active',
      createdAt: new Date('2022-06-10T08:20:00'),
      createdBy: 'admin',
      lastModifiedAt: new Date('2023-04-25T09:40:00'),
      lastModifiedBy: 'admin',
    },
  ];

  totalRecords = signal<number>(0);
  loading = signal<boolean>(false);
  first = signal<number>(0);

  rows = signal<number>(0);

  ngOnInit(): void {
    this.totalRecords.set(this.schools.length);
  }

  loadProductsLazy(event: TableLazyLoadEvent) {
    // const rows = event.rows ?? 10;
    // const first = event.first ?? 0;
    // const page = first / rows;
    // this.myService.getProducts(page, rows, event.sortField, event.sortOrder, event.filters)
    //   .subscribe(data => {
    //     this.products = data.items;
    //     this.totalRecords = data.total;
    //     this.loading = false;
    //   });
  }

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
    console.log(this.first());

    this.first.set(event.first);
    this.rows.set(event.rows);
  }

  isLastPage(): boolean {
    return this.schools
      ? this.first() + this.rows() >= this.schools.length
      : true;
  }

  isFirstPage(): boolean {
    return this.schools ? this.first() === 0 : true;
  }
}
