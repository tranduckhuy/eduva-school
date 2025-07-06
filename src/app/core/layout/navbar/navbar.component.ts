import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
  input,
  output,
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
    const isSchoolAdmin =
      role === UserRoles.SCHOOL_ADMIN || role === UserRoles.SYSTEM_ADMIN;
    const isTeacher = role === UserRoles.TEACHER;
    const isContentModerator = role === UserRoles.CONTENT_MODERATOR;
    const isTeacherOrMod = isTeacher || isContentModerator;

    const dashboardLink = isSchoolAdmin ? '/school-admin' : '/teacher';
    const profileLink = isSchoolAdmin
      ? '/school-admin/settings'
      : '/teacher/settings';

    // ? School admin management menu
    const schoolAdminNav: NavItem[] = isSchoolAdmin
      ? [
          {
            label: 'Giáo viên',
            icon: 'co_present',
            link: this.schoolAndPlanMissing()
              ? '/school-admin/subscription-plans'
              : '/school-admin/teachers',
            type: 'link',
            isActive: false,
            submenuItems: [],
          },
          {
            label: 'Kiểm duyệt viên',
            icon: 'person_check',
            link: this.schoolAndPlanMissing()
              ? '/school-admin/subscription-plans'
              : '/school-admin/content-moderators',
            type: 'link',
            isActive: false,
            submenuItems: [],
          },
          {
            label: 'Học sinh',
            icon: 'person_edit',
            link: this.schoolAndPlanMissing()
              ? '/school-admin/subscription-plans'
              : '/school-admin/students',
            type: 'link',
            isActive: false,
            submenuItems: [],
          },
          {
            label: 'Lịch sử giao dịch',
            icon: 'receipt_long',
            link: this.schoolAndPlanMissing()
              ? '/school-admin/subscription-plans'
              : '/school-admin/payments',
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
            label: 'Quản lý Tài liệu',
            icon: 'folder_open',
            link: '/teacher/file-manager',
            type: 'link',
            isActive: false,
            isDisabled: this.schoolAndPlanMissing(),
            submenuItems: [],
          },
        ]
      : [];

    // ? Learning management submenu (dynamic based on role)
    const learningSubmenu: NavItem['submenuItems'] = [];
    if (isSchoolAdmin) {
      learningSubmenu.push(
        {
          label: 'Danh sách bài học',
          link: this.schoolAndPlanMissing()
            ? '/school-admin/subscription-plans'
            : '/school-admin/lessons',
        },
        {
          label: 'Kiểm duyệt nội dung',
          link: this.schoolAndPlanMissing()
            ? '/school-admin/subscription-plans'
            : '/school-admin/moderate-lessons',
        }
      );
    }

    if (isTeacherOrMod) {
      learningSubmenu.push(
        {
          label: 'Danh sách lớp học',
          link: '/teacher/class-management',
          isDisabled: this.schoolAndPlanMissing(),
        },
        {
          label: 'Tạo bài giảng tự động',
          link: '/teacher/generate-lesson',
          isDisabled: this.schoolAndPlanMissing(),
        }
      );
    }

    if (isContentModerator && !isSchoolAdmin) {
      learningSubmenu.push({
        label: 'Kiểm duyệt nội dung',
        link: '/school-admin/moderate-lessons',
        isDisabled: this.schoolAndPlanMissing(),
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
            label: 'Trang cá nhân',
            icon: 'account_circle',
            link: profileLink,
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
