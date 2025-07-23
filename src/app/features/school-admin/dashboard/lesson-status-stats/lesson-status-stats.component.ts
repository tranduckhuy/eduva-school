import {
  ChangeDetectionStrategy,
  Component,
  signal,
  computed,
  inject,
  effect,
  input,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexTitleSubtitle,
  ApexTooltip,
  ApexDataLabels,
  ApexPlotOptions,
  ApexFill,
  ApexLegend,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { CommonModule } from '@angular/common';

import { Select } from 'primeng/select';

import { DashboardSchoolAdminResponse } from '../../../../shared/models/api/response/query/dashboard-sa-response.model';
import { PeriodType } from '../../../../shared/models/enum/period-type.enum';
import { DashboardService } from '../../../../shared/services/api/dashboard/dashboard.service';
import { LoadingService } from '../../../../shared/services/core/loading/loading.service';
import { getLastNWeekNumbers } from '../../../../shared/utils/util-functions';

interface SelectOption {
  name: string;
  code: string; // 'weekly' | 'monthly'
}

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  title: ApexTitleSubtitle;
  tooltip: ApexTooltip;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  colors: string[];
  fill: ApexFill;
  legend: ApexLegend;
};

@Component({
  selector: 'app-lesson-status-stats',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule, FormsModule, Select],
  templateUrl: './lesson-status-stats.component.html',
  styleUrl: './lesson-status-stats.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LessonStatusStatsComponent {
  private readonly dashboardService = inject(DashboardService);
  private readonly loadingService = inject(LoadingService);

  dashboardData = input.required<DashboardSchoolAdminResponse | null>();

  readonly isLoading = this.loadingService.isLoading;

  readonly timeSelectOptions = [
    { name: 'Theo tuần', code: 'weekly' },
    { name: 'Theo tháng', code: 'monthly' },
  ];
  timeSelect = signal(this.timeSelectOptions[0]);
  isChangingPeriod = signal(false);
  lastRequestedPeriod = signal<PeriodType>(PeriodType.Week);

  readonly numberOfWeeks = 7;
  readonly numberOfMonths = 12;

  constructor() {
    // Effect: fetch data when filter changes
    effect(
      () => {
        const data = this.dashboardData();

        if (data?.lessonStatusStats && data.lessonStatusStats.length > 0) {
          // Check if the data format matches the current selection
          const firstPeriod = data.lessonStatusStats[0].period;
          const isWeeklyData = firstPeriod.includes('-W');
          const isMonthlyData = /^\d{4}-\d{2}$/.exec(firstPeriod);

          // Update timeSelect to match the actual data format
          if (isWeeklyData && this.timeSelect().code !== 'weekly') {
            this.timeSelect.set({ name: 'Theo tuần', code: 'weekly' });
          } else if (isMonthlyData && this.timeSelect().code !== 'monthly') {
            this.timeSelect.set({ name: 'Theo tháng', code: 'monthly' });
          }
        }
      },
      { allowSignalWrites: true }
    );
  }

  fetchDashboardData(period: PeriodType) {
    this.isChangingPeriod.set(true);
    this.dashboardService
      .getDashboardSchoolAdminData({ lessonStatusPeriod: period })
      .subscribe({
        next: data => {
          this.isChangingPeriod.set(false);
        },
        error: () => {
          this.isChangingPeriod.set(false);
        },
      });
  }

  onTimeSelectChange(selected: SelectOption) {
    if (selected.code === this.timeSelect().code) return;
    this.timeSelect.set(selected);
    this.dashboardService
      .getDashboardSchoolAdminData({
        lessonStatusPeriod:
          selected.code === 'weekly' ? PeriodType.Week : PeriodType.Month,
      })
      .subscribe();
  }

  readonly chartData = computed(() => {
    const data = this.dashboardData();
    const timeSelectValue = this.timeSelect();
    if (!data)
      return { pending: [], approved: [], rejected: [], categories: [] };
    const stats = data.lessonStatusStats || [];
    if (timeSelectValue.code === 'weekly') {
      return this.generateWeeklyData(this.numberOfWeeks, stats);
    } else {
      return this.generateMonthlyData(this.numberOfMonths, stats);
    }
  });

  private generateWeeklyData(
    weeks: number,
    stats: Array<{
      period: string;
      pending: number;
      approved: number;
      rejected: number;
    }>
  ) {
    const lastWeekNumbers = getLastNWeekNumbers(weeks);
    const filtered = stats.filter(item => {
      const [year, week] = item.period.split('-W');
      return lastWeekNumbers.some(
        wn => wn.year === Number(year) && wn.week === Number(week)
      );
    });
    filtered.sort((a, b) => {
      const [yearA, weekA] = a.period.split('-W').map(Number);
      const [yearB, weekB] = b.period.split('-W').map(Number);
      if (yearA !== yearB) return yearA - yearB;
      return weekA - weekB;
    });
    return {
      pending: filtered.map(item => item.pending),
      approved: filtered.map(item => item.approved),
      rejected: filtered.map(item => item.rejected),
      categories: filtered.map(item => `Tuần ${item.period.split('-W')[1]}`),
    };
  }

  private generateMonthlyData(
    months: number,
    stats: Array<{
      period: string;
      pending: number;
      approved: number;
      rejected: number;
    }>
  ) {
    const now = new Date();
    const currentYear = now.getFullYear();
    // Only keep months from the current year
    const filtered = stats
      .map(item => {
        const match = item.period.match(/(\d{4})-(\d{2})/);
        if (match) {
          return {
            ...item,
            year: parseInt(match[1], 10),
            month: parseInt(match[2], 10),
          };
        }
        return null;
      })
      .filter(
        (item): item is (typeof stats)[0] & { year: number; month: number } =>
          !!item && item.year === currentYear
      );

    // Sort by month ascending
    filtered.sort((a, b) => a.month - b.month);
    // Take up to 12 months
    const recent = filtered.slice(-12);

    return {
      pending: recent.map(item => item.pending),
      approved: recent.map(item => item.approved),
      rejected: recent.map(item => item.rejected),
      categories: recent.map(item => `Th${item.month}`),
    };
  }

  readonly chartOptions = computed<ChartOptions>(() => {
    const chartData = this.chartData();
    return {
      series: [
        { name: 'Chờ duyệt', data: chartData.pending },
        { name: 'Đã duyệt', data: chartData.approved },
        { name: 'Từ chối', data: chartData.rejected },
      ],
      chart: {
        type: 'bar',
        height: 400,
        stacked: true,
        toolbar: { show: true },
      },
      colors: ['#fbbf24', '#22c55e', '#ef4444'],
      dataLabels: { enabled: true },
      plotOptions: {
        bar: {
          horizontal: true,
          barHeight: '60%',
          borderRadius: 4,
        },
      },
      fill: { opacity: 1 },
      title: { text: '', align: 'left' },
      tooltip: {
        enabled: true,
        y: { formatter: (val: number) => `${val} bài giảng` },
      },
      xaxis: {
        categories: chartData.categories,
        type: 'category',
      },
      yaxis: { min: 0 },
      legend: { position: 'top', horizontalAlign: 'left' },
    };
  });
}
