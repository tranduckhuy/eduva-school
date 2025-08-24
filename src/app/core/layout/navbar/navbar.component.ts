import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
  effect,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { UserService } from '../../../shared/services/api/user/user.service';

import { AccordionItemComponent } from './accordion-item/accordion-item.component';
import {
  type UserRoleType,
  UserRoles,
} from '../../../shared/constants/user-roles.constant';

type NavItem = {
  label: string;
  icon: string;
  type: 'link' | 'accordion' | 'button';
  link?: string;
  isDisabled?: boolean;
  suppressActive?: boolean;
  submenuItems: {
    label: string;
    link: string;
    isDisabled?: boolean;
    suppressActive?: boolean;
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
export class NavbarComponent {
  private readonly userService = inject(UserService);

  isSidebarCollapsed = input();

  closeSidebar = output();

  user = this.userService.currentUser;

  isSchoolAdmin = computed(() =>
    this.user()?.roles.includes(UserRoles.SCHOOL_ADMIN)
  );

  schoolMissing = computed(() => !this.user()?.school);
  planExpired = computed(() => {
    const subscription = this.user()?.userSubscriptionResponse;
    const isActive = subscription?.isSubscriptionActive;
    const endDate = subscription?.subscriptionEndDate;
    return !isActive || (endDate && new Date(endDate) < new Date());
  });

  navConfigs = signal<NavbarConfig[]>([]);

  constructor() {
    effect(
      () => {
        const user = this.user();
        const userRole = user?.roles?.[0] as UserRoleType;

        this.navConfigs.set(this.getNavbarConfigByRole(userRole));
      },
      { allowSignalWrites: true }
    );
  }

  get navConfigsArray(): NavbarConfig[] {
    return this.navConfigs();
  }

  get routerLinkRole() {
    const link = this.isSchoolAdmin() ? '/school-admin' : '/teacher';
    return link;
  }

  private getNavbarConfigByRole(role: UserRoleType): NavbarConfig[] {
    const isAdmin = role === UserRoles.SCHOOL_ADMIN;
    const isTeacher = role === UserRoles.TEACHER;
    const isModerator = role === UserRoles.CONTENT_MODERATOR;
    const isTeacherOrMod = isTeacher || isModerator;
    const schoolMissing = this.schoolMissing();

    const dashboardLink = isAdmin ? '/school-admin' : '/teacher';
    const settingsLink = isAdmin
      ? '/school-admin/settings/account-settings'
      : '/teacher/settings/account-settings';

    const navItems: NavbarConfig[] = [
      {
        section: 'Thống kê',
        navItems: [
          this.buildNavItem('Bảng thống kê', 'dashboard', dashboardLink),
        ],
      },
      ...this.buildGenerateLessonNav(isTeacher, isModerator, schoolMissing),
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
          this.buildNavItem('Cài đặt', 'settings', settingsLink),
          {
            label: 'Đăng xuất',
            icon: 'logout',
            type: 'button',
            submenuItems: [],
          },
        ],
      },
    ];

    return navItems;
  }

  private buildNavItem(
    label: string,
    icon: string,
    link: string,
    isDisabled = false,
    suppressActive = false
  ): NavItem {
    return {
      label,
      icon,
      type: 'link',
      link,
      isDisabled,
      suppressActive,
      submenuItems: [],
    };
  }

  private buildAdminNav(isAdmin: boolean, schoolMissing: boolean): NavItem[] {
    if (!isAdmin) return [];

    const fallback = '/school-admin/subscription-plans';

    const links = [
      {
        label: 'Trường học',
        icon: 'school',
        path: '/school-admin/school-information',
      },
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
        schoolMissing ? fallback : item.path,
        false, // isDisabled
        schoolMissing // suppressActive khi schoolMissing
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
        '/teacher/file-manager/my-drive',
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
      submenu.push({
        label,
        link,
        isDisabled,
        suppressActive: schoolMissing,
      });
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
    }

    if (isModerator && !isAdmin) {
      push('Kiểm duyệt nội dung', '/moderation', schoolMissing);
    }

    return {
      label: 'Quản lý học tập',
      icon: 'auto_stories',
      type: 'accordion',
      submenuItems: submenu,
      suppressActive: schoolMissing,
    };
  }

  private buildGenerateLessonNav(
    isTeacher: boolean,
    isModerator: boolean,
    schoolMissing: boolean
  ): NavbarConfig[] {
    if (!isTeacher && !isModerator) return [];

    return [
      {
        section: 'Dịch vụ AI',
        navItems: [
          this.buildNavItem(
            'Tạo bài giảng tự động',
            'smart_display',
            '/teacher/generate-lesson',
            schoolMissing
          ),
          this.buildNavItem(
            'Lịch sử sử dụng AI',
            'card_membership',
            '/teacher/ai-usage-logs',
            schoolMissing
          ),
        ],
      },
    ];
  }
}
