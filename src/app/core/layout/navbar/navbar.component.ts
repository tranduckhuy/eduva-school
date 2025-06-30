import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, NavigationEnd } from '@angular/router';

import { filter } from 'rxjs';

import { UserService } from '../../../shared/services/api/user/user.service';

import { AccordionItemComponent } from './accordion-item/accordion-item.component';
import {
  UserRole,
  UserRoles,
} from '../../../shared/constants/user-roles.constant';

type NavItem = {
  label: string;
  icon: string;
  type: 'link' | 'accordion' | 'button';
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
  imports: [CommonModule, RouterLink, AccordionItemComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly userService = inject(UserService);

  isSidebarCollapsed = input();

  closeSidebar = output();

  user = this.userService.currentUser;

  navConfigs: NavbarConfig[] = [];

  ngOnInit(): void {
    const user = this.user();
    const userRole = user?.roles?.[0] as UserRole;
    this.navConfigs = this.getNavbarConfigByRole(userRole);

    this.setActiveNavItems(this.router.url);

    // ? Listen to router events to update active states
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.setActiveNavItems(event.urlAfterRedirects);
      });
  }

  get routerLinkRole() {
    const link = this.user()?.roles.includes(UserRoles.SCHOOL_ADMIN)
      ? '/school-admin'
      : '/teacher';
    return link;
  }

  private setActiveNavItems(url: string) {
    const path = url.split('?')[0]; // ? Just get path name

    this.navConfigs.forEach(section => {
      section.navItems.forEach(item => {
        // ? Match exact main nav item by path only
        item.isActive = item.link === path;

        // ? Reset and re-check submenu
        item.submenuItems.forEach(sub => {
          sub.active = sub.link === path;
          if (sub.active) {
            item.isActive = true; // ? If submenu is active, parent is also active
          }
        });
      });
    });

    this.cdr.markForCheck();
  }

  private getNavbarConfigByRole(role: UserRole): NavbarConfig[] {
    const isSchoolAdmin =
      role === UserRoles.SCHOOL_ADMIN || role === UserRoles.SYSTEM_ADMIN;
    const isTeacher = role === UserRoles.TEACHER;
    const isContentModerator = role === UserRoles.CONTENT_MODERATOR;
    const isTeacherOrMod = isTeacher || isContentModerator;

    const dashboardLink = isSchoolAdmin ? '/school-admin' : '/teacher';
    const settingsLink = isSchoolAdmin
      ? '/school-admin/settings'
      : '/teacher/settings';

    // ? School admin management menu
    const schoolAdminNav: NavItem[] = isSchoolAdmin
      ? [
          {
            label: 'Trường học',
            icon: 'school',
            link: '/school-admin/schools',
            type: 'link',
            isActive: false,
            submenuItems: [],
          },
          {
            label: 'Giáo viên',
            icon: 'co_present',
            link: '/school-admin/teachers',
            type: 'link',
            isActive: false,
            submenuItems: [],
          },
          {
            label: 'Kiểm duyệt viên',
            icon: 'person_check',
            link: '/school-admin/content-moderators',
            type: 'link',
            isActive: false,
            submenuItems: [],
          },
          {
            label: 'Học sinh',
            icon: 'person_edit',
            link: '/school-admin/students',
            type: 'link',
            isActive: false,
            submenuItems: [],
          },
          {
            label: 'Lịch sử giao dịch',
            icon: 'receipt_long',
            link: '/school-admin/payments',
            type: 'link',
            isActive: false,
            submenuItems: [],
          },
        ]
      : [];

    // ? Only teachers and content moderators can access file manager
    const fileManagerNav: NavItem[] = isTeacherOrMod
      ? [
          {
            label: 'Tài liệu',
            icon: 'folder_open',
            link: '/teacher/file-manager',
            type: 'link',
            isActive: false,
            submenuItems: [],
          },
        ]
      : [];

    // ? Learning management submenu (dynamic based on role)
    const learningSubmenu: NavItem['submenuItems'] = [];
    if (isSchoolAdmin) {
      learningSubmenu.push(
        { label: 'Danh sách bài học', link: '/school-admin/lessons' },
        { label: 'Kiểm duyệt nội dung', link: '/school-admin/moderate-lessons' }
      );
    }

    if (isTeacherOrMod) {
      learningSubmenu.push(
        { label: 'Danh sách lớp học', link: '#!' },
        { label: 'Tạo bài giảng tự động', link: '/teacher/generate-lesson' }
      );
    }

    if (isContentModerator && !isSchoolAdmin) {
      learningSubmenu.push({
        label: 'Kiểm duyệt nội dung',
        link: '/school-admin/moderate-lessons',
      });
    }

    const learningNav: NavItem = {
      label: 'Quản lý học tập',
      icon: 'auto_stories',
      type: 'accordion',
      isActive: false,
      submenuItems: learningSubmenu,
    };

    // ? Merge management items
    const managementNav = [...schoolAdminNav, ...fileManagerNav, learningNav];

    return [
      {
        section: 'Thống kê',
        navItems: [
          {
            label: 'Bảng thống kê',
            icon: 'dashboard',
            type: 'link',
            link: dashboardLink,
            isActive: true,
            submenuItems: [],
          },
        ],
      },
      {
        section: 'Quản lý',
        navItems: managementNav,
      },
      {
        section: 'Khác',
        navItems: [
          {
            label: 'Cài đặt',
            icon: 'settings',
            link: settingsLink,
            type: 'link',
            isActive: false,
            submenuItems: [],
          },
          {
            label: 'Đăng xuất',
            icon: 'logout',
            type: 'button',
            isActive: false,
            submenuItems: [],
          },
        ],
      },
    ];
  }
}
