import { Routes } from '@angular/router';

export const settingRoutes: Routes = [
  {
    path: '',
    data: {
      title: 'Trang Cá Nhân',
      heading: 'Thông tin cá nhân',
      breadcrumb: 'Thông tin cá nhân',
    },
    loadComponent: () =>
      import('./personal-information/personal-information.component').then(
        mod => mod.PersonalInformationComponent
      ),
  },
  {
    path: 'account-settings',
    data: {
      title: 'Cài Đặt',
      heading: 'Mật khẩu và bảo mật',
      breadcrumb: 'Mật khẩu và bảo mật',
    },
    loadComponent: () =>
      import('./account-settings/account-settings.component').then(
        mod => mod.AccountSettingsComponent
      ),
  },
  {
    path: 'terms-conditions',
    data: {
      title: 'Điều Khoản Sử Dụng',
      heading: 'Điều khoản sử dụng',
      breadcrumb: 'Điều khoản sử dụng',
    },
    loadComponent: () =>
      import('./term-and-condition/term-and-condition.component').then(
        mod => mod.TermAndConditionComponent
      ),
  },
  {
    path: 'privacy-policy',
    data: {
      title: 'Chính Sách Bảo Mật',
      heading: 'Chính sách bảo mật',
      breadcrumb: 'Chính sách bảo mật',
    },
    loadComponent: () =>
      import('./privacy-policy/privacy-policy.component').then(
        mod => mod.PrivacyPolicyComponent
      ),
  },
];
