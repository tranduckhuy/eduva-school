import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  ApexAxisChartSeries,
  ApexFill,
  NgApexchartsModule,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexTooltip,
  ApexStroke,
  ApexLegend,
  ApexGrid,
  ApexDataLabels,
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
  tooltip: ApexTooltip;
  stroke: ApexStroke;
  legend: ApexLegend;
  grid: ApexGrid;
  dataLabels: ApexDataLabels;
  colors: string[];
};

interface SelectOption {
  name: string;
  code: string;
}

@Component({
  selector: 'app-revenue-trend',
  standalone: true,
  imports: [NgApexchartsModule, FormsModule, Select],
  templateUrl: './revenue-trend.component.html',
  styleUrl: './revenue-trend.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RevenueTrendComponent implements OnInit {
  chartOptions = signal<ChartOptions | undefined>(undefined);
  timeSelect = signal<SelectOption>({ name: 'Theo tháng', code: 'monthly' });

  readonly timeSelectOptions = signal<SelectOption[]>([
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
          name: 'Credit Points',
          data: [] as DataPoint[],
        },
        {
          name: 'Pricing Plan',
          data: [] as DataPoint[],
        },
      ],
      chart: {
        type: 'line',
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
      colors: ['#467fcf', '#5eba00'],
      dataLabels: { enabled: false },
      stroke: {
        curve: 'smooth',
        width: 3,
      },
      tooltip: {
        enabled: true,
        y: {
          formatter: (val: number) => `${this.formatVND(val)}`,
        },
      },
      xaxis: {
        type: 'datetime',
        labels: {
          formatter: (value: string) => {
            if (this.timeSelect().code === 'monthly') {
              return new Date(value).toLocaleDateString('vi-VN', {
                month: 'short',
                year: 'numeric',
              });
            } else {
              return new Date(value).getFullYear().toString();
            }
          },
        },
      },
      yaxis: {
        labels: {
          formatter: (value: number) => `${this.formatVND(value)}`,
        },
      },
      legend: {
        position: 'top',
        horizontalAlign: 'left',
      },
      grid: {
        borderColor: '#f1f1f1',
        strokeDashArray: 3,
      },
    };
  }

  private formatVND(value: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  onTimeSelectChange(selected: SelectOption) {
    this.timeSelect.set(selected);
    this.loadChartData();
  }

  private loadChartData(): void {
    let creditPointsData: DataPoint[] = [];
    let pricingPlanData: DataPoint[] = [];

    if (this.timeSelect().code === 'monthly') {
      creditPointsData = this.generateMonthlyData(12, 5000000, 15000000);
      pricingPlanData = this.generateMonthlyData(12, 3000000, 10000000);
    } else {
      creditPointsData = this.generateYearlyData(5, 50000000, 150000000);
      pricingPlanData = this.generateYearlyData(5, 30000000, 100000000);
    }

    this.updateChartData(creditPointsData, pricingPlanData);
  }

  private generateMonthlyData(
    months: number,
    min: number,
    max: number
  ): DataPoint[] {
    const data: DataPoint[] = [];
    const now = new Date();

    for (let i = months; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const revenue = Math.floor(Math.random() * (max - min + 1)) + min;

      data.push({
        x: date.getTime(),
        y: revenue,
        fill: {
          type: 'solid',
        },
      });
    }

    return data;
  }

  private generateYearlyData(
    years: number,
    min: number,
    max: number
  ): DataPoint[] {
    const data: DataPoint[] = [];
    const now = new Date();

    for (let i = years; i >= 0; i--) {
      const date = new Date(now.getFullYear() - i, 0, 1);
      const revenue = Math.floor(Math.random() * (max - min + 1)) + min;

      data.push({
        x: date.getTime(),
        y: revenue,
        fill: {
          type: 'solid',
        },
      });
    }

    return data;
  }

  private updateChartData(
    creditPoints: DataPoint[],
    pricingPlan: DataPoint[]
  ): void {
    const currentOptions = this.chartOptions();
    if (!currentOptions) return;

    this.chartOptions.set({
      ...currentOptions,
      series: [
        {
          name: 'Credit Points',
          data: creditPoints,
        },
        {
          name: 'Pricing Plan',
          data: pricingPlan,
        },
      ],
      xaxis: {
        ...currentOptions.xaxis,
        labels: {
          formatter: (value: string) => {
            if (this.timeSelect().code === 'monthly') {
              return new Date(value).toLocaleDateString('vi-VN', {
                month: 'short',
                year: 'numeric',
              });
            } else {
              return new Date(value).getFullYear().toString();
            }
          },
        },
      },
    });
  }
}
