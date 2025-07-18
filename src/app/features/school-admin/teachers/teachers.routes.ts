import { Routes } from '@angular/router';

export const teachersRoute: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./teachers.component').then(mod => mod.TeachersComponent),
    data: {
      heading: 'Danh sách giáo viên',
      breadcrumb: 'Danh sách giáo viên',
    },
  },
  {
    path: ':teacherId/update',
    loadComponent: () =>
      import('./update-teacher/update-teacher.component').then(
        mod => mod.UpdateTeacherComponent
      ),
    data: {
      heading: 'Cập nhật thông tin giáo viên',
      breadcrumb: 'Cập nhật giáo viên',
    },
  },
  {
    path: ':teacherId',
    loadComponent: () =>
      import('./teacher/teacher.component').then(mod => mod.TeacherComponent),
    data: {
      heading: 'Thông tin giáo viên',
      breadcrumb: 'Thông tin giáo viên',
    },
  },
];
