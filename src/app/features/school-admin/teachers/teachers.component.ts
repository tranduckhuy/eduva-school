import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { TooltipModule } from 'primeng/tooltip';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { ConfirmationService } from 'primeng/api';

import { LeadingZeroPipe } from '../../../shared/pipes/leading-zero.pipe';

import { SearchInputComponent } from '../../../shared/components/search-input/search-input.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { GlobalModalService } from '../../../shared/services/layout/global-modal/global-modal.service';
import { ImportAccountsComponent } from '../../../shared/components/import-accounts/import-accounts.component';
import { AddTeacherModalComponent } from './add-teacher-modal/add-teacher-modal.component';
import { UserService } from '../../../shared/services/api/user/user.service';
import { LoadingService } from '../../../shared/services/core/loading/loading.service';
import { PAGE_SIZE } from '../../../shared/constants/common.constant';
import { UserListParams } from '../../../shared/models/api/request/query/user-list-params';
import { SelectModule } from 'primeng/select';
import { FormControl, FormsModule } from '@angular/forms';
import { TableSkeletonComponent } from '../../../shared/components/skeleton/table-skeleton/table-skeleton.component';

interface StatusOption {
  name: string;
  code: number | undefined;
}

@Component({
  selector: 'app-teachers',
  standalone: true,
  imports: [
    SearchInputComponent,
    BadgeComponent,
    SelectModule,
    FormsModule,
    ButtonComponent,
    TableModule,
    LeadingZeroPipe,
    TooltipModule,
    RouterLink,
    ImportAccountsComponent,
    TableSkeletonComponent,
  ],
  templateUrl: './teachers.component.html',
  styleUrl: './teachers.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeachersComponent {
  private readonly globalModalService = inject(GlobalModalService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly userService = inject(UserService);
  private readonly loadingService = inject(LoadingService);

  // Pagination & Sorting signals
  first = signal<number>(0);
  rows = signal<number>(PAGE_SIZE);
  sortField = signal<string | null>(null);
  sortOrder = signal<number>(0); // 1 = asc, -1 = desc
  statusSelect = signal<StatusOption | undefined>(undefined);
  selectedTimeFilter = signal<
    { name: string; value: string | undefined } | undefined
  >(undefined);
  searchTerm = signal<string>('');
  tableHeadSkeleton = signal([
    'STT',
    'Giáo viên',
    'Số điện thoại',
    'Email',
    'Trạng thái',
    'Hành động',
  ]);

  readonly statusSelectOptions = signal<StatusOption[]>([
    { name: 'Đang hoạt động', code: 0 },
    { name: 'Vô hiệu hóa', code: 3 },
    { name: 'Tất cả', code: undefined },
  ]);

  readonly timeFilterOptions = signal([
    { name: 'Mới nhất', value: 'desc' },
    { name: 'Cũ nhất', value: 'asc' },
  ]);

  // Signals from service
  isLoadingGet = this.loadingService.is('get-users');
  isLoadingArchive = this.loadingService.is('archive-user');
  isLoadingActive = this.loadingService.is('active-user');

  users = this.userService.users;
  totalUsers = this.userService.totalUsers;

  private loadData(): void {
    const params: UserListParams = {
      role: 4,
      pageIndex: Math.floor(this.first() / this.rows()) + 1,
      pageSize: this.rows(),
      searchTerm: this.searchTerm(),
      sortBy: this.sortField() ?? 'createdAt',
      sortDirection: this.sortOrder() === 1 ? 'asc' : 'desc',
      activeOnly: this.getActiveOnlyStatus(),
    };

    this.userService.getUsers(params).subscribe();
  }

  private getActiveOnlyStatus(): boolean | undefined {
    const statusCode = this.statusSelect()?.code;
    if (statusCode === 0) return true;
    if (statusCode === 1) return false;
    return undefined;
  }

  onTimeFilterChange(
    selected: { name: string; value: string | undefined } | undefined
  ): void {
    this.selectedTimeFilter.set(selected);

    if (selected?.value) {
      this.sortField.set('createdAt');
      this.sortOrder.set(selected.value === 'desc' ? -1 : 1);
    } else {
      this.sortField.set(null);
      this.sortOrder.set(1);
    }

    this.first.set(0);
    this.loadData();
  }

  loadDataLazy(event: TableLazyLoadEvent): void {
    const first = event.first ?? 0;
    const rows = event.rows ?? PAGE_SIZE;

    // Handle sorting
    if (event.sortField) {
      this.sortField.set(
        Array.isArray(event.sortField) ? event.sortField[0] : event.sortField
      );
      this.sortOrder.set(event.sortOrder ?? 1);
    }

    this.first.set(first);
    this.rows.set(rows);
    this.loadData();
  }

  onStatusSelectChange(selected: StatusOption | undefined): void {
    this.statusSelect.set(selected);
    this.first.set(0); // Reset to first page when filter changes
    this.loadData();
  }

  onSearchTriggered(term: string): void {
    this.searchTerm.set(term);
    this.sortField.set(null);
    this.sortOrder.set(1);
    this.first.set(0); // Reset to first page when search changes
    this.loadData();
  }

  openConfirmArchiveDialog(event: Event, userId: string): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Bạn có chắc chắn muốn vô hiệu hóa người dùng này không?',
      header: 'Vô hiệu hóa người dùng',
      icon: 'pi pi-info-circle',
      rejectLabel: 'Hủy',
      rejectButtonProps: {
        label: 'Hủy',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Xác nhận',
        severity: 'danger',
      },
      accept: () => {
        this.userService.archiveUser(userId).subscribe({
          next: () => this.loadData(),
        });
      },
    });
  }
  openConfirmActiveDialog(event: Event, userId: string): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Bạn có chắc chắn muốn kích hoạt người dùng này không?',
      header: 'Kích hoạt người dùng',
      icon: 'pi pi-exclamation-triangle',
      rejectLabel: 'Hủy',
      rejectButtonProps: {
        label: 'Hủy',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Xác nhận',
      },
      accept: () => {
        this.userService.activateUser(userId).subscribe({
          next: () => this.loadData(),
        });
      },
    });
  }

  openAddTeacherModal() {
    this.globalModalService.open(AddTeacherModalComponent);
  }
}
