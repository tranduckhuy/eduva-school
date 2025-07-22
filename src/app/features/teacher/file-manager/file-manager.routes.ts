import { Routes } from '@angular/router';

export const fileManagerRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'my-drive',
  },
  {
    path: 'my-drive',
    data: {
      heading: 'Tất cả thư mục',
      breadcrumb: '',
    },
    loadComponent: () =>
      import('./my-drive/my-drive.component').then(mod => mod.MyDriveComponent),
    children: [
      {
        path: '',
        data: {
          title: 'Danh sách thư mục',
          breadcrumb: 'Danh sách thư mục',
        },
        loadComponent: () =>
          import('./lesson-table/lesson-table.component').then(
            mod => mod.LessonTableComponent
          ),
      },
      {
        path: ':folderId',
        data: {
          title: 'Danh sách bài học',
          heading: 'Danh sách bài học',
          breadcrumb: 'Danh sách bài học',
        },
        loadComponent: () =>
          import('./material-table/material-table.component').then(
            mod => mod.MaterialTableComponent
          ),
      },
      {
        path: 'update-material/:folderId/:materialId',
        data: {
          title: 'Chỉnh sửa bài học',
          heading: 'Chỉnh sửa bài học',
          breadcrumb: 'Chỉnh sửa bài học',
        },
        loadComponent: () =>
          import('./update-material/update-material.component').then(
            mod => mod.UpdateMaterialComponent
          ),
      },
      {
        path: 'material-detail/:materialId',
        data: {
          title: 'Chi tiết bài học',
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
