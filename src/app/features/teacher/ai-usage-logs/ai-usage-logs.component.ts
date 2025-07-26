import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { TableModule, type TableLazyLoadEvent } from 'primeng/table';

import { LeadingZeroPipe } from '../../../shared/pipes/leading-zero.pipe';

import { AiUsageLogsService } from './services/ai-usage-logs.service';
import { LoadingService } from '../../../shared/services/core/loading/loading.service';

import { PAGE_SIZE } from '../../../shared/constants/common.constant';
import { LessonGenerationType } from '../../../shared/models/enum/lesson-generation-type.enum';

import { SearchInputComponent } from '../../../shared/components/search-input/search-input.component';
import { TableSkeletonComponent } from '../../../shared/components/skeleton/table-skeleton/table-skeleton.component';
import { TableEmptyStateComponent } from '../../../shared/components/table-empty-state/table-empty-state.component';

import { type GetAiUsageLogsRequest } from './models/get-ai-usage-logs-request.model';

@Component({
  selector: 'app-ai-usage-logs',
  standalone: true,
  imports: [
    DatePipe,
    TableModule,
    LeadingZeroPipe,
    SearchInputComponent,
    TableSkeletonComponent,
    TableEmptyStateComponent,
  ],
  templateUrl: './ai-usage-logs.component.html',
  styleUrl: './ai-usage-logs.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AiUsageLogsComponent {
  private readonly aiUsageLogsService = inject(AiUsageLogsService);
  private readonly loadingService = inject(LoadingService);

  aiUsageLogs = this.aiUsageLogsService.aiUsageLogs;
  totalRecords = this.aiUsageLogsService.totalRecords;
  isLoading = this.loadingService.isLoading;

  currentPage = signal(1);
  pageSize = signal(PAGE_SIZE);
  firstRecordIndex = signal(0);
  searchValue = signal('');
  shouldStopRequest = signal<boolean>(false);

  tableHeadSkeleton = signal([
    'STT',
    'Dịch vụ AI',
    'Thời lượng (phút)',
    'Số Ecoin đã trừ',
    'Ngày sử dụng',
  ]);

  onSearch(searchTerm?: string): void {
    this.searchValue.set(searchTerm ?? '');
    this.currentPage.set(1);
    this.firstRecordIndex.set(0);

    this.loadData();
  }

  onLazyLoad(event: TableLazyLoadEvent): void {
    const rows = event.rows ?? this.pageSize();
    const first = event.first ?? 0;
    const page = Math.floor(first / rows) + 1;

    this.currentPage.set(page);
    this.pageSize.set(rows);
    this.firstRecordIndex.set(first);

    this.loadData();
  }

  getAiUsageType(type: LessonGenerationType) {
    return type === LessonGenerationType.Audio
      ? 'Tạo nội dung Audio'
      : 'Tạo nội dung Video';
  }

  getAiDurationMinutes(durationMinutes: number): string {
    const totalSeconds = Math.round(durationMinutes * 60);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const parts: string[] = [];

    if (hours > 0) {
      parts.push(`${hours} giờ`);
    }

    if (minutes > 0 || hours > 0) {
      parts.push(`${minutes} phút`);
    }

    if (seconds > 0 || (hours === 0 && minutes === 0)) {
      parts.push(`${seconds} giây`);
    }

    return parts.join(' ');
  }

  private loadData(): void {
    if (this.shouldStopRequest()) return;

    const request: GetAiUsageLogsRequest = {
      pageIndex: this.currentPage(),
      pageSize: this.pageSize(),
      searchTerm: this.searchValue(),
      sortBy: 'createdAt',
      sortDirection: 'desc',
    };
    this.aiUsageLogsService.getAiUsageLogs(request).subscribe({
      error: () => this.shouldStopRequest.set(true),
    });
  }
}
