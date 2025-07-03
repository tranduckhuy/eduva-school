import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

import { ProgressBar } from 'primeng/progressbar';
import { TooltipModule } from 'primeng/tooltip';

interface StatCard {
  title: string;
  description: string;
  value: number;
  compareValue?: number;
  unit?: string;
  isRevenue?: boolean;
  icon: string;
  iconColor: string;
  subItems?: SubItem[];
}

interface SubItem {
  title: string;
  value: number;
}

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [ProgressBar, TooltipModule, CurrencyPipe],
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatCardComponent {
  statCard = input.required<StatCard>();

  getPercent(value: number) {
    return Math.round((value / this.statCard().value) * 100);
  }
}
