import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  signal,
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

import { Select } from 'primeng/select';
import { TableModule } from 'primeng/table';

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
export class LessonCreationComponent implements OnInit {
  chartOptions = signal<ChartOptions | undefined>(undefined);
  timeSelect = signal<SelectOption>({ name: 'Theo tuần', code: 'weekly' });

  readonly timeSelectOptions = signal<SelectOption[]>([
    { name: 'Theo tuần', code: 'weekly' },
    { name: 'Theo tháng', code: 'monthly' },
  ]);

  topCreators = signal<TopCreator[]>([]);

  constructor() {
    this.chartOptions.set(this.initChartOptions());
  }

  ngOnInit(): void {
    this.loadChartData();
  }

  private toApexDataPointArray(data: DataPoint[]): {
    x: any;
    y: any;
    fill?: ApexFill;
    fillColor?: string;
    strokeColor?: string;
    meta?: any;
  }[] {
    return data.map(({ x, y, fill, fillColor, strokeColor, meta }) => ({
      x,
      y,
      fill,
      fillColor,
      strokeColor,
      meta,
    }));
  }

  private initChartOptions(): ChartOptions {
    return {
      series: [
        {
          name: 'Tạo bởi AI',
          data: [] as DataPoint[],
        },
        {
          name: 'Tải lên',
          data: [] as DataPoint[],
        },
      ],
      chart: {
        type: 'bar',
        height: 400,
        stacked: true,
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
        enabled: true,
      },
      plotOptions: {
        bar: {
          horizontal: true,
          barHeight: '60%',
          borderRadius: 4,
        },
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
      },
      yaxis: {
        min: 0,
        labels: {
          formatter: (value: string | number) => {
            if (this.timeSelect().code === 'weekly') {
              return `Tuần ${value}`;
            } else {
              return value.toString();
            }
          },
        },
      },
      legend: {
        position: 'top',
        horizontalAlign: 'left',
      },
    };
  }

  onTimeSelectChange(selected: SelectOption) {
    this.timeSelect.set(selected);
    this.loadChartData();
  }

  private handleBarClick(index: number) {
    // Implement logic to show daily breakdown
  }

  private loadChartData(): void {
    let sampleData: { ai: DataPoint[]; uploaded: DataPoint[] };

    if (this.timeSelect().code === 'weekly') {
      sampleData = this.generateWeeklyData(8);
    } else {
      sampleData = this.generateMonthlyData(6);
    }

    this.updateChartData(sampleData.ai, sampleData.uploaded);
  }

  private generateWeeklyData(weeks: number): {
    ai: DataPoint[];
    uploaded: DataPoint[];
  } {
    const aiData: DataPoint[] = [];
    const uploadedData: DataPoint[] = [];
    const now = new Date();

    for (let i = weeks; i >= 0; i--) {
      const weekNumber = ((getWeek(now) - i + 52) % 52) + 1;
      const aiCount = Math.floor(Math.random() * 30) + 10;
      const uploadedCount = Math.floor(Math.random() * 15) + 5;

      aiData.push({
        x: weekNumber.toString(),
        y: aiCount,
        fill: {
          type: 'solid',
        },
      });

      uploadedData.push({
        x: weekNumber.toString(),
        y: uploadedCount,
        fill: {
          type: 'solid',
        },
      });
    }

    return { ai: aiData, uploaded: uploadedData };
  }

  private generateMonthlyData(months: number): {
    ai: DataPoint[];
    uploaded: DataPoint[];
  } {
    const aiData: DataPoint[] = [];
    const uploadedData: DataPoint[] = [];
    const now = new Date();
    const monthNames = [
      'Th1',
      'Th2',
      'Th3',
      'Th4',
      'Th5',
      'Th6',
      'Th7',
      'Th8',
      'Th9',
      'Th10',
      'Th11',
      'Th12',
    ];

    for (let i = months; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = monthNames[date.getMonth()];
      const aiCount = Math.floor(Math.random() * 120) + 40;
      const uploadedCount = Math.floor(Math.random() * 60) + 20;

      aiData.push({
        x: monthName,
        y: aiCount,
        fill: {
          type: 'solid',
        },
      });

      uploadedData.push({
        x: monthName,
        y: uploadedCount,
        fill: {
          type: 'solid',
        },
      });
    }

    return { ai: aiData, uploaded: uploadedData };
  }

  private updateChartData(
    aiData: DataPoint[],
    uploadedData: DataPoint[]
  ): void {
    const currentOptions = this.chartOptions();
    if (!currentOptions) return;

    this.chartOptions.set({
      ...currentOptions,
      series: [
        {
          name: 'Tạo bởi AI',
          data: aiData,
        },
        {
          name: 'Tải lên',
          data: uploadedData,
        },
      ],
      xaxis: {
        ...currentOptions.xaxis,
        type: 'category',
      },
      yaxis: {
        ...currentOptions.yaxis,
        labels: {
          formatter: (value: string | number) => {
            if (this.timeSelect().code === 'weekly') {
              return `Tuần ${value}`;
            } else {
              return value.toString();
            }
          },
        },
      },
    });
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
