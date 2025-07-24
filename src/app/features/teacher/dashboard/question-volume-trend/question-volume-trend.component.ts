import {
  ChangeDetectionStrategy,
  Component,
  signal,
  computed,
  inject,
  effect,
} from '@angular/core';
import {
  NgApexchartsModule,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexTooltip,
  ApexDataLabels,
  ApexPlotOptions,
  ApexFill,
  ApexLegend,
  ApexStroke,
} from 'ng-apexcharts';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { DashboardService } from '../../../../shared/services/api/dashboard/dashboard.service';
import { PeriodType } from '../../../../shared/models/enum/period-type.enum';
import { DashboardTeacherResponse } from '../../../../shared/models/api/response/query/dashboard-teacher-response.model';
import { getLastNWeekNumbers } from '../../../../shared/utils/util-functions';
import { CommonModule } from '@angular/common';

interface SelectOption {
  name: string;
  code: string;
}

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  stroke: ApexStroke;
  tooltip: ApexTooltip;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  colors: string[];
  fill: ApexFill;
  legend: ApexLegend;
};

// Add DataPoint type
type DataPoint = {
  x: string | number | Date;
  y: number;
  fill: ApexFill;
  fillColor?: string;
  strokeColor?: string;
  meta?: any;
};

@Component({
  selector: 'app-question-volume-trend',
  standalone: true,
  imports: [NgApexchartsModule, FormsModule, Select, CommonModule],
  templateUrl: './question-volume-trend.component.html',
  styleUrl: './question-volume-trend.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionVolumeTrendComponent {
  private readonly dashboardService = inject(DashboardService);

  // State
  timeSelect = signal<SelectOption>({ name: 'Theo tuần', code: 'weekly' });
  isChangingPeriod = signal<boolean>(false);
  dashboardData = signal<DashboardTeacherResponse | null>(null);

  readonly timeSelectOptions = [
    { name: 'Theo tuần', code: 'weekly' },
    { name: 'Theo tháng', code: 'monthly' },
  ];

  constructor() {
    effect(
      () => {
        const data = this.dashboardData();

        if (data?.questionVolumeTrend && data.questionVolumeTrend.length > 0) {
          // Check if the data format matches the current selection
          const firstPeriod = data.questionVolumeTrend[0].period;
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
    this.fetchData(PeriodType.Week);
  }

  onTimeSelectChange(selected: SelectOption) {
    if (!selected || selected.code === this.timeSelect().code) return;
    this.timeSelect.set(selected);
    const periodType =
      selected.code === 'weekly' ? PeriodType.Week : PeriodType.Month;
    this.fetchData(periodType);
  }

  private fetchData(period: PeriodType) {
    this.isChangingPeriod.set(true);
    this.dashboardService
      .getTeacherDashboardData({ questionVolumePeriod: period })
      .subscribe({
        next: data => {
          this.dashboardData.set(data);
          this.isChangingPeriod.set(false);
        },
        error: () => this.isChangingPeriod.set(false),
      });
  }

  // Computed chart data that reacts to dashboard data changes
  readonly chartData = computed(() => {
    const data = this.dashboardData();
    const timeSelectValue = this.timeSelect();

    if (!data) {
      return { question: [], answer: [] };
    }

    if (timeSelectValue.code === 'weekly') {
      return this.generateWeeklyData(7, data);
    } else {
      return this.generateMonthlyData(data, 12);
    }
  });

  private generateWeeklyData(
    weeks: number,
    data: DashboardTeacherResponse
  ): {
    question: DataPoint[];
    answer: DataPoint[];
  } {
    const questionActivities = data?.questionVolumeTrend;

    if (!questionActivities || questionActivities.length === 0) {
      return { question: [], answer: [] };
    }

    const lastWeekNumbers = getLastNWeekNumbers(weeks);

    const filterQuestionActivitiesByWeeks = questionActivities.filter(item => {
      const [year, week] = item.period.split('-W');
      return lastWeekNumbers.some(
        (weekNumber: { year: number; week: number }) => {
          return (
            weekNumber.year === Number(year) && weekNumber.week === Number(week)
          );
        }
      );
    });

    const questionData = filterQuestionActivitiesByWeeks.map((item: any) => ({
      x: Number(item.period.split('-W')[1]),
      y: item.totalQuestions,
      fill: { type: 'solid' },
    }));

    const answerData = filterQuestionActivitiesByWeeks.map((item: any) => ({
      x: Number(item.period.split('-W')[1]),
      y: item.totalAnswers,
      fill: { type: 'solid' },
    }));

    return { question: questionData, answer: answerData };
  }

  private generateMonthlyData(
    data: DashboardTeacherResponse,
    months: number = 12
  ): {
    question: DataPoint[];
    answer: DataPoint[];
  } {
    const questionActivities = data?.questionVolumeTrend;

    if (!questionActivities || questionActivities.length === 0) {
      return { question: [], answer: [] };
    }

    const questionsData = questionActivities.map((item: any) => {
      const periodParts = item.period.split('-');
      let monthNumber: number;

      if (periodParts.length === 2) {
        monthNumber = parseInt(periodParts[1], 10);
      } else {
        monthNumber = 1;
      }

      return {
        x: monthNumber,
        y: item.totalQuestions,
        fill: { type: 'solid' },
      };
    });

    const answersData = questionActivities.map((item: any) => {
      const periodParts = item.period.split('-');
      let monthNumber: number;

      if (periodParts.length === 2) {
        monthNumber = parseInt(periodParts[1], 10);
      } else {
        monthNumber = 1;
      }

      return {
        x: monthNumber,
        y: item.totalAnswers,
        fill: { type: 'solid' },
      };
    });

    return { question: questionsData, answer: answersData };
  }

  // Computed chart options that react to chart data changes
  readonly chartOptions = computed<ChartOptions>(() => {
    const chartData = this.chartData();
    const timeSelectValue = this.timeSelect();

    return {
      series: [
        {
          name: 'Câu hỏi',
          data: chartData.question,
        },
        {
          name: 'Câu trả lời',
          data: chartData.answer,
        },
      ],
      chart: {
        type: 'line',
        height: 410,
        toolbar: { show: true },
      },
      colors: ['#2093e7', '#22c03c'],
      dataLabels: { enabled: false },
      stroke: {
        curve: 'smooth',
      },
      plotOptions: {},
      fill: { opacity: 1 },

      tooltip: {
        enabled: true,
        y: { formatter: (val: number) => `${val}` },
      },
      xaxis: {
        type: 'category' as const,
        labels: {
          rotate: -45,
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
      yaxis: { min: 0 },
      legend: { position: 'top' as const, horizontalAlign: 'left' as const },
    };
  });
}
