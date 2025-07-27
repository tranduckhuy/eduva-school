import {
  ChangeDetectionStrategy,
  Component,
  signal,
  computed,
  effect,
  input,
  output,
  inject,
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

import { SelectModule, type SelectChangeEvent } from 'primeng/select';

import { LoadingService } from '../../../../shared/services/core/loading/loading.service';

import { PeriodType } from '../../../../shared/models/enum/period-type.enum';

import { getLastNWeekNumbers } from '../../../../shared/utils/util-functions';

import { type DashboardSchoolAdminResponse } from '../../../../shared/models/api/response/query/dashboard-sa-response.model';

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
  imports: [CommonModule, FormsModule, NgApexchartsModule, SelectModule],
  templateUrl: './lesson-status-stats.component.html',
  styleUrl: './lesson-status-stats.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LessonStatusStatsComponent {
  private readonly loadingService = inject(LoadingService);

  dashboardData = input.required<DashboardSchoolAdminResponse | null>();

  periodChange = output<PeriodType>();

  isChangingPeriod = this.loadingService.is('dashboard');

  timeSelect = signal<SelectOption>({ name: 'Theo tuần', code: 'weekly' });
  hasUserChangedTimeSelect = signal<boolean>(false);

  readonly chartData = computed(() => {
    const data = this.dashboardData();
    const timeSelectValue = this.timeSelect();
    if (!data)
      return { pending: [], approved: [], rejected: [], categories: [] };
    const stats = data.lessonStatusStats || [];
    if (timeSelectValue.code === 'weekly') {
      return this.generateWeeklyData(this.numberOfWeeks, stats);
    } else {
      return this.generateMonthlyData(stats);
    }
  });

  readonly timeSelectOptions = signal<SelectOption[]>([
    { name: 'Theo tuần', code: 'weekly' },
    { name: 'Theo tháng', code: 'monthly' },
  ]);

  readonly numberOfWeeks = 7;
  readonly numberOfMonths = 12;

  constructor() {
    effect(
      () => {
        const data = this.dashboardData();

        if (this.hasUserChangedTimeSelect()) return;

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

  onTimeSelectChange(selected: SelectChangeEvent) {
    if (selected.value.code === this.timeSelect().code) return;

    this.timeSelect.set(selected.value);
    this.hasUserChangedTimeSelect.set(true);

    const periodType =
      selected.value.code === 'weekly' ? PeriodType.Week : PeriodType.Month;

    this.periodChange.emit(periodType);
  }

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
    const yearMonthRegex = /(\d{4})-(\d{2})/;
    const filtered = stats
      .map(item => {
        const match = yearMonthRegex.exec(item.period);
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
