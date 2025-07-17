import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
  input,
  output,
  effect,
  computed,
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
  isDisabled?: boolean;
  submenuItems: {
    label: string;
    link: string;
    active?: boolean;
    isDisabled?: boolean;
  }[];
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

  isSchoolAdmin = computed(() =>
    this.user()?.roles.includes(UserRoles.SCHOOL_ADMIN)
  );

  schoolAndPlanMissing = computed(
    () =>
      !this.user()?.school ||
      !this.user()?.userSubscriptionResponse.isSubscriptionActive
  );

  navConfigs: NavbarConfig[] = [];

  constructor() {
    effect(
      () => {
        const user = this.user();
        const userRole = user?.roles?.[0] as UserRole;

        this.navConfigs = this.getNavbarConfigByRole(userRole);

        this.setActiveNavItems(this.router.url);
      },
      { allowSignalWrites: true }
    );
  }

  ngOnInit(): void {
    // ? Listen to router events to update active states
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.setActiveNavItems(event.urlAfterRedirects);
      });
  }

  get routerLinkRole() {
    const link = this.isSchoolAdmin() ? '/school-admin' : '/teacher';
    return link;
  }

  private setActiveNavItems(url: string) {
    const path = url.split('?')[0]; // ? Just get path name

    if (path === '/school-admin/subscription-plans') {
      this.navConfigs.forEach(section => {
        section.navItems.forEach(item => {
          if (
            item.link === '/school-admin' ||
            item.link === '/school-admin/settings' ||
            item.type === 'button'
          ) {
            item.isActive = item.link === path;
          } else {
            item.isActive = false;
          }
          item.submenuItems.forEach(sub => (sub.active = false));
        });
      });
      this.cdr.markForCheck();
      return;
    }

    this.navConfigs.forEach(section => {
      section.navItems.forEach(item => {
        item.isActive = item.link === path;
        item.submenuItems.forEach(sub => {
          sub.active = sub.link === path;
          if (sub.active) item.isActive = true;
        });
      });
    });

    this.cdr.markForCheck();
  }

  private getNavbarConfigByRole(role: UserRole): NavbarConfig[] {
    const isAdmin = this.isAdminRole(role);
    const isTeacher = role === UserRoles.TEACHER;
    const isModerator = role === UserRoles.CONTENT_MODERATOR;
    const isTeacherOrMod = isTeacher || isModerator;
    const schoolMissing = this.schoolAndPlanMissing();

    const dashboardLink = isAdmin ? '/school-admin' : '/teacher';
    const profileLink = isAdmin
      ? '/school-admin/settings/account-settings'
      : '/teacher/settings/account-settings';

    const navItems: NavbarConfig[] = [
      {
        section: 'Thống kê',
        navItems: [
          this.buildNavItem('Bảng thống kê', 'dashboard', dashboardLink),
        ],
      },
      {
        section: 'Quản lý',
        navItems: [
          ...this.buildAdminNav(isAdmin, schoolMissing),
          ...this.buildFileManagerNav(isTeacherOrMod, schoolMissing),
          this.buildLearningNav({
            isAdmin,
            isTeacher,
            isModerator,
            schoolMissing,
          }),
        ],
      },
      {
        section: 'Khác',
        navItems: [
          this.buildNavItem('Cài đặt', 'settings', profileLink),
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

    return navItems;
  }

  private isAdminRole(role: UserRole): boolean {
    return role === UserRoles.SCHOOL_ADMIN || role === UserRoles.SYSTEM_ADMIN;
  }

  private buildNavItem(
    label: string,
    icon: string,
    link: string,
    isDisabled = false
  ): NavItem {
    return {
      label,
      icon,
      type: 'link',
      link,
      isActive: false,
      isDisabled,
      submenuItems: [],
    };
  }

  private buildAdminNav(isAdmin: boolean, schoolMissing: boolean): NavItem[] {
    if (!isAdmin) return [];

    const fallback = '/school-admin/subscription-plans';

    const links = [
      {
        label: 'Giáo viên',
        icon: 'co_present',
        path: '/school-admin/teachers',
      },
      {
        label: 'Kiểm duyệt viên',
        icon: 'person_check',
        path: '/school-admin/content-moderators',
      },
      {
        label: 'Học sinh',
        icon: 'person_edit',
        path: '/school-admin/students',
      },
      {
        label: 'Lịch sử giao dịch',
        icon: 'receipt_long',
        path: '/school-admin/payments',
      },
    ];

    return links.map(item =>
      this.buildNavItem(
        item.label,
        item.icon,
        schoolMissing ? fallback : item.path
      )
    );
  }

  private buildFileManagerNav(
    isAllowed: boolean,
    schoolMissing: boolean
  ): NavItem[] {
    if (!isAllowed) return [];
    return [
      this.buildNavItem(
        'Quản lý tài liệu',
        'folder_open',
        '/teacher/file-manager',
        schoolMissing
      ),
    ];
  }

  private buildLearningNav({
    isAdmin,
    isTeacher,
    isModerator,
    schoolMissing,
  }: {
    isAdmin: boolean;
    isTeacher: boolean;
    isModerator: boolean;
    schoolMissing: boolean;
  }): NavItem {
    const submenu: NavItem['submenuItems'] = [];

    const push = (label: string, link: string, isDisabled?: boolean) => {
      submenu.push({ label, link, isDisabled });
    };

    if (isAdmin) {
      const fallback = '/school-admin/subscription-plans';
      push(
        'Tài liệu chia sẻ',
        schoolMissing ? fallback : '/school-admin/shared-lessons'
      );
      push('Kiểm duyệt nội dung', schoolMissing ? fallback : '/moderation');
    }

    if (isTeacher || isModerator) {
      push('Tài liệu chia sẻ', '/teacher/shared-lessons', schoolMissing);
      push('Danh sách lớp học', '/teacher/class-management', schoolMissing);
      push('Tạo bài giảng tự động', '/teacher/generate-lesson', schoolMissing);
    }

    if (isModerator && !isAdmin) {
      push('Kiểm duyệt nội dung', '/moderation', schoolMissing);
    }

    return {
      label: 'Quản lý học tập',
      icon: 'auto_stories',
      type: 'accordion',
      isActive: false,
      submenuItems: submenu,
    };
  }
}
