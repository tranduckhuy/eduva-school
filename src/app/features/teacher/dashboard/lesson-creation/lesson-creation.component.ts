import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  signal,
  computed,
  effect,
  input,
  output,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { type SelectChangeEvent, SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';

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

import { getLastNWeekNumbers } from '../../../../shared/utils/util-functions';

import { LoadingService } from '../../../../shared/services/core/loading/loading.service';

import { PeriodType } from '../../../../shared/models/enum/period-type.enum';

import { type DashboardTeacherResponse } from '../../../../shared/models/api/response/query/dashboard-teacher-response.model';

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
  imports: [NgApexchartsModule, FormsModule, SelectModule, TableModule],
  templateUrl: './lesson-creation.component.html',
  styleUrl: './lesson-creation.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LessonCreationComponent implements OnInit {
  private readonly loadingService = inject(LoadingService);

  dashboardData = input.required<DashboardTeacherResponse | null>();

  periodChange = output<PeriodType>();

  isChangingPeriod = this.loadingService.is('dashboard');

  timeSelect = signal<SelectOption>({ name: 'Theo tuần', code: 'weekly' });
  hasUserChangedTimeSelect = signal<boolean>(false);

  readonly timeSelectOptions = signal<SelectOption[]>([
    { name: 'Theo tuần', code: 'weekly' },
    { name: 'Theo tháng', code: 'monthly' },
  ]);

  topCreators = signal<TopCreator[]>([]);

  readonly chartData = computed(() => {
    const data = this.dashboardData();
    const timeSelectValue = this.timeSelect();

    if (!data) {
      return { ai: [], uploaded: [] };
    }

    if (timeSelectValue.code === 'weekly') {
      const result = this.generateWeeklyData(12, data);
      return result;
    } else {
      const result = this.generateMonthlyData(data);
      return result;
    }
  });

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

  constructor() {
    effect(
      () => {
        const data = this.dashboardData();

        if (this.hasUserChangedTimeSelect()) return;

        if (data?.lessonActivity && data.lessonActivity.length > 0) {
          const firstPeriod = data.lessonActivity[0].period;
          const isWeeklyData = firstPeriod.includes('-W');
          const isMonthlyData = /^\d{4}-\d{2}$/.exec(firstPeriod);

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

  ngOnInit(): void {
    const data = this.dashboardData();
    if (!data) return;

    this.generateWeeklyData(12, data);
  }

  onTimeSelectChange(selected: SelectChangeEvent) {
    if (!selected || selected.value.code === this.timeSelect().code) {
      return;
    }

    this.hasUserChangedTimeSelect.set(true);
    this.timeSelect.set(selected.value);

    const periodType =
      selected.value.code === 'weekly' ? PeriodType.Week : PeriodType.Month;

    this.periodChange.emit(periodType);
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

  private generateMonthlyData(data: DashboardTeacherResponse): {
    ai: DataPoint[];
    uploaded: DataPoint[];
  } {
    const lessonActivities = data?.lessonActivity;
    if (!lessonActivities || lessonActivities.length === 0) {
      return { ai: [], uploaded: [] };
    }

    const currentYear = new Date().getFullYear();

    // Only keep months from the current year
    const yearMonthRegex = /(\d{4})-(\d{2})/;
    const filtered = lessonActivities
      .map(item => {
        const match = yearMonthRegex.exec(item.period);
        if (match) {
          const year = parseInt(match[1], 10);
          const month = parseInt(match[2], 10);
          return {
            ...item,
            year,
            month,
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
        } => {
          const isValid = !!item && item.year === currentYear;
          return isValid;
        }
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

    const result = { ai: aiData, uploaded: uploadedData };
    return result;
  }
}
