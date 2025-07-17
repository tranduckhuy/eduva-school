import { Routes } from '@angular/router';

export const contentModeratorsRoute: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./content-moderators.component').then(
        mod => mod.ContentModeratorsComponent
      ),
    data: {
      heading: 'Danh sách kiểm duyệt viên',
      breadcrumb: 'Danh sách kiểm duyệt viên',
    },
  },
  {
    path: ':contentModeratorId',
    loadComponent: () =>
      import('./content-moderator/content-moderator.component').then(
        mod => mod.ContentModeratorComponent
      ),
    data: {
      heading: 'Thông tin kiểm duyệt viên',
      breadcrumb: 'Thông tin kiểm duyệt viên',
    },
  },
];
