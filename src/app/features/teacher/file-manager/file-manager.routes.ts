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
    children: [
      {
        path: '',
        data: {
          breadcrumb: 'Danh sách bài giảng',
        },
        loadComponent: () =>
          import('./lesson-table/lesson-table.component').then(
            mod => mod.LessonTableComponent
          ),
      },
      {
        path: ':folderId',
        data: {
          heading: 'Danh sách bài học',
          breadcrumb: 'Danh sách bài học',
        },
        loadComponent: () =>
          import('./material-table/material-table.component').then(
            mod => mod.MaterialTableComponent
          ),
      },
      {
        path: ':folderId/:materialId',
        data: {
          heading: 'Chi tiết bài học',
          breadcrumb: 'Chi tiết bài học',
        },
        loadComponent: () =>
          import(
            '../../../shared/components/lesson-details/preview-lesson/preview-lesson.component'
          ).then(mod => mod.PreviewLessonComponent),
      },
    ],
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
