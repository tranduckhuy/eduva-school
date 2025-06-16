import { Routes } from '@angular/router';

export const fileManagerRoutes: Routes = [
  {
    path: '',
    data: {
      heading: 'Tất cả bài giảng',
      breadcrumb: 'Tất cả bài giảng',
    },
    loadComponent: () =>
      import('./my-drive/my-drive.component').then(mod => mod.MyDriveComponent),
  },
  {
    path: 'recent',
    data: {
      heading: 'Gần đây',
      breadcrumb: 'Gần đây',
    },
    loadComponent: () =>
      import('./recent/recent.component').then(mod => mod.RecentComponent),
  },
  {
    path: 'bin',
    data: {
      heading: 'Thùng rác',
      breadcrumb: 'Thùng rác',
    },
    loadComponent: () =>
      import('./trash-bin/trash-bin.component').then(
        mod => mod.TrashBinComponent
      ),
  },
];
