import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ApexNonAxisChartSeries,
  ApexChart,
  ApexResponsive,
  ApexLegend,
  NgApexchartsModule,
} from 'ng-apexcharts';

import { DashboardTeacherResponse } from '../../../../shared/models/api/response/query/dashboard-teacher-response.model';

export type PieChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  colors: string[];
  responsive: ApexResponsive[];
  legend: ApexLegend;
  plotOptions?: any;
  fill?: any;
};

@Component({
  selector: 'app-content-type-stats',
  standalone: true,
  imports: [NgApexchartsModule, CommonModule],
  templateUrl: './content-type-stats.component.html',
  styleUrl: './content-type-stats.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContentTypeStatsComponent {
  readonly dashboardData = input.required<DashboardTeacherResponse>();

  readonly pieChartOptions = computed<PieChartOptions>(() => {
    const stats = this.dashboardData()?.contentTypeStats?.[0];
    return {
      series: stats ? [stats.pdf, stats.doc, stats.audio, stats.video] : [],
      chart: {
        type: 'donut',
        height: 400,
        width: 400,
      },
      labels: ['PDF', 'DOCX', 'Audio', 'Video'],
      colors: ['#00c6fb', '#005bea', '#ff6a00', '#ee0979'],
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: { width: 200 },
            legend: { position: 'bottom' },
          },
        },
      ],
      plotOptions: {
        pie: {
          startAngle: 90, // Custom start angle
          donut: {
            size: '70%',
          },
        },
      },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'light',
          type: 'diagonal1',
          shadeIntensity: 0.5,
          gradientToColors: ['#00c6fb', '#005bea', '#ff6a00', '#ee0979'],
          inverseColors: false,
          opacityFrom: 1,
          opacityTo: 1,
          stops: [0, 100],
        },
      },
      legend: {
        position: 'bottom',
        horizontalAlign: 'center',
      },
    };
  });

  readonly totalContentCount = computed(() => {
    const stats = this.dashboardData()?.contentTypeStats?.[0];
    if (!stats) return 0;
    return (
      (stats.pdf ?? 0) +
      (stats.doc ?? 0) +
      (stats.audio ?? 0) +
      (stats.video ?? 0)
    );
  });
}
