import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccordionItemComponent } from './accordion-item/accordion-item.component';

type NavItem = {
  label: string;
  icon: string;
  type: 'link' | 'accordion';
  link?: string;
  isActive: boolean;
  submenuItems: { label: string; link: string; active?: boolean }[];
};

type NavbarConfig = {
  section: string;
  navItems: NavItem[];
};

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, AccordionItemComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
  closeSidebar = output();
  isSidebarCollapsed = input();

  navConfigs: NavbarConfig[] = [
    {
      section: 'Thống kê',
      navItems: [
        {
          label: 'Bảng thống kê',
          icon: 'dashboard',
          type: 'link',
          isActive: true,
          submenuItems: [],
        },
      ],
    },
    {
      section: 'Quản lý',
      navItems: [
        {
          label: 'Quản lý trường học',
          icon: 'school',
          link: '/school-admin/schools',
          type: 'link',
          isActive: false,
          submenuItems: [],
        },
        {
          label: 'Quản lý giáo viên',
          icon: 'co_present',
          link: '/school-admin/teachers',
          type: 'link',
          isActive: false,
          submenuItems: [],
        },
        {
          label: 'Quản lý học sinh',
          icon: 'person_edit',
          link: '/school-admin/students',
          type: 'link',
          isActive: false,
          submenuItems: [],
        },
        {
          label: 'Quản lý hóa đơn',
          icon: 'receipt_long',
          link: '/school-admin/invoices',
          type: 'link',
          isActive: false,
          submenuItems: [],
        },
        {
          label: 'Quản lý tài liệu',
          icon: 'folder_open',
          link: '/teacher/file-manager',
          type: 'link',
          isActive: false,
          submenuItems: [],
        },
        {
          label: 'Quản lý học tập',
          icon: 'auto_stories',
          type: 'accordion',
          isActive: false,
          submenuItems: [
            { label: 'Danh sách lớp học', link: '#!', active: true },
            {
              label: 'Tạo bài giảng tự động',
              link: '/teacher/generate-lesson',
            },
            { label: 'Duyệt nội dung bài giảng', link: '#!' },
          ],
        },
      ],
    },
    {
      section: 'Khác',
      navItems: [
        {
          label: 'Trang cá nhân',
          icon: 'account_circle',
          type: 'link',
          isActive: false,
          submenuItems: [],
        },
        {
          label: 'Cài đặt',
          icon: 'settings',
          type: 'accordion',
          isActive: false,
          submenuItems: [
            { label: 'Account Settings', link: '#!', active: true },
            { label: 'Change Password', link: '#!' },
            { label: 'Privacy Policy', link: '#!' },
            { label: 'Terms & Conditions', link: '#!' },
          ],
        },
        {
          label: 'Đăng xuất',
          icon: 'logout',
          type: 'link',
          isActive: false,
          submenuItems: [],
        },
      ],
    },
  ];
}
