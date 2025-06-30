import { Routes } from '@angular/router';

export const contentModeratorsRoute: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./content-moderators.component').then(
        mod => mod.ContentModeratorsComponent
      ),
    data: {
      heading: 'Danh sách kiểm duyệt nội dung',
      breadcrumb: 'Danh sách kiểm duyệt nội dung',
    },
  },
  {
    path: ':contentModeratorId',
    loadComponent: () =>
      import('./content-moderator/content-moderator.component').then(
        mod => mod.ContentModeratorComponent
      ),
    data: {
      heading: 'Chi tiết kiểm duyệt nội dung',
      breadcrumb: 'Chi tiết kiểm duyệt nội dung',
    },
  },
];
