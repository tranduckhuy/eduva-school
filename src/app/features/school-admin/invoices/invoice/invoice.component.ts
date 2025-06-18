import { ChangeDetectionStrategy, Component, LOCALE_ID } from '@angular/core';
import { CurrencyPipe, DatePipe, registerLocaleData } from '@angular/common';
import localeVi from '@angular/common/locales/vi';
import { TableModule } from 'primeng/table';

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
  selector: 'app-invoice',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, TableModule],
  templateUrl: './invoice.component.html',
  styleUrl: './invoice.component.css',
  providers: [DatePipe, { provide: LOCALE_ID, useValue: 'vi' }],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoiceComponent {
  invoice: Invoice = {
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
  };

  constructor(private readonly datePipe: DatePipe) {}

  formatDateVi(date: Date | string): string {
    return this.datePipe.transform(date, 'medium', undefined, 'vi') ?? '';
  }
}
