import {
  ChangeDetectionStrategy,
  Component,
  signal,
  computed,
  inject,
  effect,
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
  ApexStroke,
} from 'ng-apexcharts';

import { Select } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { DashboardService } from '../../../../shared/services/api/dashboard/dashboard.service';
import { PeriodType } from '../../../../shared/models/enum/period-type.enum';
import { getLastNWeekNumbers } from '../../../../shared/utils/util-functions';
import { DashboardTeacherResponse } from '../../../../shared/models/api/response/query/dashboard-teacher-response.model';

type DataPoint = {
  x: string | number | Date;
  y: number;
  fill: ApexFill;
  fillColor?: string;
  strokeColor?: string;
  meta?: any;
};

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  stroke: ApexStroke;
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

interface SelectOption {
  name: string;
  code: string;
}

interface TopCreator {
  name: string;
  school: string;
  lessons: number;
  aiGenerated: number;
  uploaded: number;
}

@Component({
  selector: 'app-lesson-creation',
  standalone: true,
  imports: [NgApexchartsModule, FormsModule, Select, TableModule],
  templateUrl: './lesson-creation.component.html',
  styleUrl: './lesson-creation.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LessonCreationComponent {
  private readonly dashboardService = inject(DashboardService);

  dashboardData = signal<DashboardTeacherResponse | null>(null);

  timeSelect = signal<SelectOption>({ name: 'Theo tuần', code: 'weekly' });
  isChangingPeriod = signal<boolean>(false);
  lastRequestedPeriod = signal<PeriodType>(PeriodType.Week);

  readonly timeSelectOptions = signal<SelectOption[]>([
    { name: 'Theo tuần', code: 'weekly' },
    { name: 'Theo tháng', code: 'monthly' },
  ]);

  topCreators = signal<TopCreator[]>([]);

  constructor() {
    // Effect to detect when dashboard data changes and ensure timeSelect matches the data
    effect(
      () => {
        const data = this.dashboardData();

        if (data?.lessonActivity && data.lessonActivity.length > 0) {
          // Check if the data format matches the current selection
          const firstPeriod = data.lessonActivity[0].period;
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
    // Fetch data for the first time
    this.fetchDashboardData(PeriodType.Week);
  }

  // Computed chart data that reacts to dashboard data changes
  readonly chartData = computed(() => {
    const data = this.dashboardData();
    const timeSelectValue = this.timeSelect();

    if (!data) {
      return { ai: [], uploaded: [] };
    }

    if (timeSelectValue.code === 'weekly') {
      return this.generateWeeklyData(12, data);
    } else {
      return this.generateMonthlyData(data, 12);
    }
  });

  // Computed chart options that react to chart data changes
  readonly chartOptions = computed<ChartOptions>(() => {
    const chartData = this.chartData();
    const timeSelectValue = this.timeSelect();

    return {
      series: [
        {
          name: 'Tạo bởi AI',
          data: chartData.ai,
        },
        {
          name: 'Tải lên',
          data: chartData.uploaded,
        },
      ],
      chart: {
        type: 'line',
        height: 400,
        toolbar: {
          show: true,
          tools: {
            download: true,
            selection: true,
            zoom: true,
            zoomin: true,
            zoomout: true,
            pan: true,
            reset: true,
          },
        },
        events: {
          click: (event, chartContext, config) => {
            // Handle bar click for daily breakdown
            // this.handleBarClick(config.dataPointIndex);
          },
        },
      },
      colors: ['#2093e7', '#22c03c'],
      dataLabels: {
        enabled: false,
      },
      plotOptions: {},
      stroke: {
        curve: 'smooth',
      },
      markers: {
        size: 5,
      },
      fill: {
        opacity: 1,
      },
      title: {
        text: '',
        align: 'left',
      },
      tooltip: {
        enabled: true,
        y: {
          formatter: (val: number) => `${val} bài học`,
        },
      },
      xaxis: {
        type: 'category',
        labels: {
          formatter: (value: string | number) => {
            const v = Number(value);
            if (timeSelectValue.code === 'weekly') {
              return `Tuần ${v}`;
            } else {
              return `Th${v}`;
            }
          },
        },
      },
      yaxis: {
        min: 0,
      },
      legend: {
        position: 'top',
        horizontalAlign: 'left',
      },
    };
  });

  onTimeSelectChange(selected: SelectOption) {
    // Only proceed if the selection actually changed
    if (selected.code === this.timeSelect().code) {
      return;
    }

    this.timeSelect.set(selected);
    const periodType =
      selected.code === 'weekly' ? PeriodType.Week : PeriodType.Month;
    this.lastRequestedPeriod.set(periodType);
    this.fetchDashboardData(periodType);
  }

  private fetchDashboardData(period: PeriodType) {
    this.isChangingPeriod.set(true);
    this.dashboardService
      .getTeacherDashboardData({ lessonActivityPeriod: period })
      .subscribe({
        next: data => {
          this.dashboardData.set(data);
          this.isChangingPeriod.set(false);
        },
        error: error => {
          this.isChangingPeriod.set(false);
        },
      });
  }

  private handleBarClick(index: number) {
    // Implement logic to show daily breakdown
  }

  private generateWeeklyData(
    weeks: number,
    data: DashboardTeacherResponse
  ): {
    ai: DataPoint[];
    uploaded: DataPoint[];
  } {
    const lessonActivities = data?.lessonActivity;

    if (!lessonActivities || lessonActivities.length === 0) {
      return { ai: [], uploaded: [] };
    }

    const lastWeekNumbers = getLastNWeekNumbers(weeks);

    const filterLessonActivitiesByWeeks = lessonActivities.filter(item => {
      const [year, week] = item.period.split('-W');
      return lastWeekNumbers.some(weekNumber => {
        return (
          weekNumber.year === Number(year) && weekNumber.week === Number(week)
        );
      });
    });

    const result = {
      aiData: filterLessonActivitiesByWeeks.map(item => ({
        x: Number(item.period.split('-W')[1]), // week number as number
        y: item.aiGeneratedCount,
        fill: {
          type: 'solid',
        },
      })),
      uploaded: filterLessonActivitiesByWeeks.map(item => ({
        x: Number(item.period.split('-W')[1]), // week number as number
        y: item.uploadedCount,
        fill: {
          type: 'solid',
        },
      })),
    };

    return { ai: result.aiData, uploaded: result.uploaded };
  }

  private generateMonthlyData(
    data: DashboardTeacherResponse,
    months: number = 12
  ): {
    ai: DataPoint[];
    uploaded: DataPoint[];
  } {
    const lessonActivities = data?.lessonActivity;
    if (!lessonActivities || lessonActivities.length === 0) {
      return { ai: [], uploaded: [] };
    }

    const currentYear = new Date().getFullYear();
    // Only keep months from the current year
    const filtered = lessonActivities
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
        (
          item
        ): item is DashboardTeacherResponse['lessonActivity'][0] & {
          year: number;
          month: number;
        } => !!item && item.year === currentYear
      );

    // Sort by month ascending
    filtered.sort((a, b) => a.month - b.month);
    // Take up to 12 months
    const recent = filtered.slice(-12);

    const aiData = recent.map(item => ({
      x: item.month, // month number as number
      y: item.aiGeneratedCount,
      fill: { type: 'solid' },
    }));
    const uploadedData = recent.map(item => ({
      x: item.month, // month number as number
      y: item.uploadedCount,
      fill: { type: 'solid' },
    }));
    return { ai: aiData, uploaded: uploadedData };
  }
}

// Add this to your Date prototype for week number calculation
declare global {
  interface Date {
    getWeek(): number;
  }
}

function getWeek(date: Date): number {
  const d = new Date(date.getTime());
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  return (
    1 +
    Math.round(
      ((d.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7
    )
  );
}
