import { CurrencyPipe, DatePipe, registerLocaleData } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  LOCALE_ID,
  signal,
} from '@angular/core';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import localeVi from '@angular/common/locales/vi';
import { SearchInputComponent } from '../../../shared/components/search-input/search-input.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { LeadingZeroPipe } from '../../../shared/pipes/leading-zero.pipe';
import { TooltipModule } from 'primeng/tooltip';
import { RouterLink } from '@angular/router';

interface Invoice {
  id: number;
  client: {
    id: number;
    name: string;
    avatarUrl: string;
    email: string;
    phoneNumber: string;
  };
  school: {
    id: string;
    name: string;
  };
  amount: number;
  pricingPlan: {
    id: string;
    name: string;
    description: string;
    price: number;
    creditLimit: number;
    storageLimit: number;
    maxAccounts: number;
    billingCycle: string;
  };
  status: 'paid' | 'pending' | 'cancelled';
  startDate: Date;
  endDate: Date;
}

registerLocaleData(localeVi);

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    SearchInputComponent,
    BadgeComponent,
    ButtonComponent,
    TableModule,
    LeadingZeroPipe,
    TooltipModule,
    RouterLink,
  ],
  templateUrl: './invoices.component.html',
  styleUrl: './invoices.component.css',
  providers: [{ provide: LOCALE_ID, useValue: 'vi-VN' }],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoicesComponent {
  invoices: Invoice[] = [
    {
      id: 1,
      client: {
        id: 101,
        name: 'Nguyễn Văn An',
        avatarUrl: 'https://i.pravatar.cc/150?img=1',
        email: 'an.nguyen@example.com',
        phoneNumber: '+84901234567',
      },
      school: {
        id: 'SCH001',
        name: 'Trường THPT Nguyễn Trãi',
      },
      amount: 1500000,
      pricingPlan: {
        id: 'PP001',
        name: 'Gói Cơ Bản',
        description: 'Gói đăng ký hàng tháng cơ bản',
        price: 1500000,
        creditLimit: 100,
        storageLimit: 10,
        maxAccounts: 5,
        billingCycle: 'monthly',
      },
      status: 'paid',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-31'),
    },
    {
      id: 2,
      client: {
        id: 101,
        name: 'Nguyễn Văn An',
        avatarUrl: 'https://i.pravatar.cc/150?img=1',
        email: 'an.nguyen@example.com',
        phoneNumber: '+84901234567',
      },
      school: {
        id: 'SCH001',
        name: 'Trường THPT Nguyễn Trãi',
      },
      amount: 3000000,
      pricingPlan: {
        id: 'PP002',
        name: 'Gói Nâng Cao',
        description: 'Gói đăng ký hàng tháng nâng cao',
        price: 3000000,
        creditLimit: 300,
        storageLimit: 30,
        maxAccounts: 15,
        billingCycle: 'monthly',
      },
      status: 'paid',
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-02-29'),
    },
    {
      id: 3,
      client: {
        id: 101,
        name: 'Nguyễn Văn An',
        avatarUrl: 'https://i.pravatar.cc/150?img=1',
        email: 'an.nguyen@example.com',
        phoneNumber: '+84901234567',
      },
      school: {
        id: 'SCH001',
        name: 'Trường THPT Nguyễn Trãi',
      },
      amount: 3000000,
      pricingPlan: {
        id: 'PP002',
        name: 'Gói Nâng Cao',
        description: 'Gói đăng ký hàng tháng nâng cao',
        price: 3000000,
        creditLimit: 300,
        storageLimit: 30,
        maxAccounts: 15,
        billingCycle: 'monthly',
      },
      status: 'pending',
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-03-31'),
    },
    {
      id: 4,
      client: {
        id: 101,
        name: 'Nguyễn Văn An',
        avatarUrl: 'https://i.pravatar.cc/150?img=1',
        email: 'an.nguyen@example.com',
        phoneNumber: '+84901234567',
      },
      school: {
        id: 'SCH001',
        name: 'Trường THPT Nguyễn Trãi',
      },
      amount: 4500000,
      pricingPlan: {
        id: 'PP003',
        name: 'Gói Doanh Nghiệp',
        description: 'Gói đăng ký hàng tháng dành cho doanh nghiệp',
        price: 4500000,
        creditLimit: 500,
        storageLimit: 50,
        maxAccounts: 50,
        billingCycle: 'monthly',
      },
      status: 'paid',
      startDate: new Date('2024-04-01'),
      endDate: new Date('2024-04-30'),
    },
    {
      id: 5,
      client: {
        id: 101,
        name: 'Nguyễn Văn An',
        avatarUrl: 'https://i.pravatar.cc/150?img=1',
        email: 'an.nguyen@example.com',
        phoneNumber: '+84901234567',
      },
      school: {
        id: 'SCH001',
        name: 'Trường THPT Nguyễn Trãi',
      },
      amount: 1500000,
      pricingPlan: {
        id: 'PP001',
        name: 'Gói Cơ Bản',
        description: 'Gói đăng ký hàng tháng cơ bản',
        price: 1500000,
        creditLimit: 100,
        storageLimit: 10,
        maxAccounts: 5,
        billingCycle: 'monthly',
      },
      status: 'cancelled',
      startDate: new Date('2024-05-01'),
      endDate: new Date('2024-05-31'),
    },
    {
      id: 6,
      client: {
        id: 101,
        name: 'Nguyễn Văn An',
        avatarUrl: 'https://i.pravatar.cc/150?img=1',
        email: 'an.nguyen@example.com',
        phoneNumber: '+84901234567',
      },
      school: {
        id: 'SCH001',
        name: 'Trường THPT Nguyễn Trãi',
      },
      amount: 3000000,
      pricingPlan: {
        id: 'PP002',
        name: 'Gói Nâng Cao',
        description: 'Gói đăng ký hàng tháng nâng cao',
        price: 3000000,
        creditLimit: 300,
        storageLimit: 30,
        maxAccounts: 15,
        billingCycle: 'monthly',
      },
      status: 'paid',
      startDate: new Date('2024-06-01'),
      endDate: new Date('2024-06-30'),
    },
    {
      id: 7,
      client: {
        id: 101,
        name: 'Nguyễn Văn An',
        avatarUrl: 'https://i.pravatar.cc/150?img=1',
        email: 'an.nguyen@example.com',
        phoneNumber: '+84901234567',
      },
      school: {
        id: 'SCH001',
        name: 'Trường THPT Nguyễn Trãi',
      },
      amount: 1500000,
      pricingPlan: {
        id: 'PP001',
        name: 'Gói Cơ Bản',
        description: 'Gói đăng ký hàng tháng cơ bản',
        price: 1500000,
        creditLimit: 100,
        storageLimit: 10,
        maxAccounts: 5,
        billingCycle: 'monthly',
      },
      status: 'paid',
      startDate: new Date('2024-07-01'),
      endDate: new Date('2024-07-31'),
    },
    {
      id: 8,
      client: {
        id: 101,
        name: 'Nguyễn Văn An',
        avatarUrl: 'https://i.pravatar.cc/150?img=1',
        email: 'an.nguyen@example.com',
        phoneNumber: '+84901234567',
      },
      school: {
        id: 'SCH001',
        name: 'Trường THPT Nguyễn Trãi',
      },
      amount: 4500000,
      pricingPlan: {
        id: 'PP003',
        name: 'Gói Doanh Nghiệp',
        description: 'Gói đăng ký hàng tháng dành cho doanh nghiệp',
        price: 4500000,
        creditLimit: 500,
        storageLimit: 50,
        maxAccounts: 50,
        billingCycle: 'monthly',
      },
      status: 'paid',
      startDate: new Date('2024-08-01'),
      endDate: new Date('2024-08-31'),
    },
    {
      id: 9,
      client: {
        id: 101,
        name: 'Nguyễn Văn An',
        avatarUrl: 'https://i.pravatar.cc/150?img=1',
        email: 'an.nguyen@example.com',
        phoneNumber: '+84901234567',
      },
      school: {
        id: 'SCH001',
        name: 'Trường THPT Nguyễn Trãi',
      },
      amount: 3000000,
      pricingPlan: {
        id: 'PP002',
        name: 'Gói Nâng Cao',
        description: 'Gói đăng ký hàng tháng nâng cao',
        price: 3000000,
        creditLimit: 300,
        storageLimit: 30,
        maxAccounts: 15,
        billingCycle: 'monthly',
      },
      status: 'pending',
      startDate: new Date('2024-09-01'),
      endDate: new Date('2024-09-30'),
    },
    {
      id: 10,
      client: {
        id: 101,
        name: 'Nguyễn Văn An',
        avatarUrl: 'https://i.pravatar.cc/150?img=1',
        email: 'an.nguyen@example.com',
        phoneNumber: '+84901234567',
      },
      school: {
        id: 'SCH001',
        name: 'Trường THPT Nguyễn Trãi',
      },
      amount: 1500000,
      pricingPlan: {
        id: 'PP001',
        name: 'Gói Cơ Bản',
        description: 'Gói đăng ký hàng tháng cơ bản',
        price: 1500000,
        creditLimit: 100,
        storageLimit: 10,
        maxAccounts: 5,
        billingCycle: 'monthly',
      },
      status: 'paid',
      startDate: new Date('2024-10-01'),
      endDate: new Date('2024-10-31'),
    },
  ];

  totalRecords = signal<number>(0);
  loading = signal<boolean>(false);
  first = signal<number>(0);
  rows = signal<number>(10);

  ngOnInit(): void {
    this.totalRecords.set(this.invoices.length);
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
    return this.invoices
      ? this.first() + this.rows() >= this.invoices.length
      : true;
  }

  isFirstPage(): boolean {
    return this.invoices ? this.first() === 0 : true;
  }

  get pagedInvoices() {
    return this.invoices.slice(this.first(), this.first() + this.rows());
  }
}
