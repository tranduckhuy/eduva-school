import { Routes } from '@angular/router';

export const invoicesRoute: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./invoices.component').then(mod => mod.InvoicesComponent),
    data: {
      heading: 'Danh sách hóa đơn',
      breadcrumb: 'Danh sách hóa đơn',
    },
  },
  {
    path: ':invoiceId',
    loadComponent: () =>
      import('./invoice/invoice.component').then(mod => mod.InvoiceComponent),
    data: {
      heading: 'Chi tiết hóa đơn',
      breadcrumb: 'Chi tiết hóa đơn',
    },
  },
];
