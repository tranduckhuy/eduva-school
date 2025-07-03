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
  ApexMarkers,
  ApexAnnotations,
  ApexDataLabels,
  ApexStroke,
  ApexFill,
  NgApexchartsModule,
} from 'ng-apexcharts';

import { Select } from 'primeng/select';

type DataPoint = {
  x: number;
  y: number;
  fill: ApexFill;
  fillColor?: string;
  strokeColor?: string;
  meta?: any;
  goals?: any;
  barHeightOffset?: number;
  columnWidthOffset?: number;
};

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  title: ApexTitleSubtitle;
  tooltip: ApexTooltip;
  markers: ApexMarkers;
  annotations: ApexAnnotations;
  dataLabels: ApexDataLabels;
  stroke: ApexStroke;
  colors: string[];
};

interface SelectOption {
  name: string;
  code: string | undefined;
}

@Component({
  selector: 'app-user-registration-trend',
  standalone: true,
  imports: [NgApexchartsModule, FormsModule, Select],
  templateUrl: './user-registration-trend.component.html',
  styleUrl: './user-registration-trend.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserRegistrationTrendComponent implements OnInit {
  chartOptions = signal<ChartOptions | undefined>(undefined);
  timeSelect = signal<SelectOption>({ name: 'Theo tháng', code: 'monthly' });
  readonly timeSelectOptions = signal<SelectOption[]>([
    { name: 'Theo ngày', code: 'daily' },
    { name: 'Theo tháng', code: 'monthly' },
    { name: 'Theo năm', code: 'yearly' },
  ]);

  constructor() {
    this.chartOptions.set(this.initChartOptions());
  }

  ngOnInit(): void {
    this.loadChartData();
  }

  private initChartOptions(): ChartOptions {
    return {
      series: [
        {
          name: 'Quản trị viên trường',
          data: [] as DataPoint[],
        },
      ],
      chart: {
        type: 'area',
        height: 300,
        zoom: { enabled: true },
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
      colors: ['#467fcf'],
      dataLabels: { enabled: false },
      stroke: {
        curve: 'smooth',
        width: 3,
      },
      title: {
        text: '',
        align: 'left',
      },
      markers: {
        size: 5,
        hover: { size: 7 },
      },
      tooltip: {
        enabled: true,
        y: {
          formatter: (val: number) => `${val} quản trị viên`,
        },
      },
      xaxis: {
        type: 'datetime',
        // title: { text: 'Thời gian' },
        labels: {
          formatter: (value: string) => new Date(value).toLocaleDateString(),
        },
      },
      yaxis: {
        // title: { text: 'Số lượng người dùng mới' },
        min: 0,
      },
      annotations: { points: [] },
    };
  }

  onTimeSelectChange(selected: SelectOption) {
    this.timeSelect.set(selected);
    this.loadChartData();
  }

  private loadChartData(): void {
    let sampleData: DataPoint[] = [];
    if (this.timeSelect().code === 'daily') {
      sampleData = this.generateSampleData(30);
    } else if (this.timeSelect().code === 'monthly') {
      sampleData = this.generateMonthlyData(12);
    } else if (this.timeSelect().code === 'yearly') {
      sampleData = this.generateYearlyData(5);
    }
    this.updateChartData(sampleData);
  }

  private generateMonthlyData(months: number): DataPoint[] {
    const data: DataPoint[] = [];
    const now = new Date();
    let currentValue = 0;
    for (let i = months; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      currentValue += Math.floor(Math.random() * 10);
      data.push({
        x: date.getTime(),
        y: currentValue,
        fill: {
          type: 'gradient',
          gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.7,
            opacityTo: 0.9,
            stops: [0, 100],
          },
        },
      });
    }
    return data;
  }

  private generateYearlyData(years: number): DataPoint[] {
    const data: DataPoint[] = [];
    const now = new Date();
    let currentValue = 0;
    for (let i = years; i >= 0; i--) {
      const date = new Date(now.getFullYear() - i, 0, 1);
      currentValue += Math.floor(Math.random() * 50);
      data.push({
        x: date.getTime(),
        y: currentValue,
        fill: {
          type: 'gradient',
          gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.7,
            opacityTo: 0.9,
            stops: [0, 100],
          },
        },
      });
    }
    return data;
  }

  private generateSampleData(days: number): DataPoint[] {
    const data: DataPoint[] = [];
    const now = new Date();
    let currentValue = 0;

    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      currentValue += Math.floor(Math.random() * 4);
      currentValue = Math.max(0, currentValue);

      data.push({
        x: date.getTime(),
        y: currentValue,
        fill: {
          type: 'gradient',
          gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.7,
            opacityTo: 0.9,
            stops: [0, 100],
          },
        },
      });
    }

    return data;
  }

  private updateChartData(data: DataPoint[]): void {
    const currentOptions = this.chartOptions();
    if (!currentOptions) return;
    this.chartOptions.set({
      ...currentOptions,
      series: [
        {
          ...currentOptions.series[0],
          data: data,
        },
      ],
    });
  }
}
