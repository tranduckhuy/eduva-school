import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';

import { ProgressBarModule } from 'primeng/progressbar';
import { TooltipModule } from 'primeng/tooltip';

import { FileStorageService } from '../../services/file-storage.service';

import { FileManagerRedirectComponent } from '../file-manager-redirect/file-manager-redirect.component';

@Component({
  selector: 'file-manager-sidebar',
  standalone: true,
  imports: [ProgressBarModule, TooltipModule, FileManagerRedirectComponent],
  templateUrl: './file-manager-sidebar.component.html',
  styleUrl: './file-manager-sidebar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileManagerSidebarComponent implements OnInit {
  private readonly fileStorageService = inject(FileStorageService);

  usedStorage = signal<number>(0);
  usagePercentage = signal<number>(0);
  limitStorage = signal<number>(0);

  tooltipText = computed(() => {
    return `${this.formatStorage(this.usedStorage())} / ${this.formatStorage(this.limitStorage())}`;
  });

  ngOnInit(): void {
    this.fileStorageService.getFileStorageQuota().subscribe({
      next: res => {
        if (res) {
          this.usedStorage.set(res.usedGB);
          this.usagePercentage.set(res.usagePercentage);
          this.limitStorage.set(res.limitGB);
        }
      },
    });
  }

  formatStorage(value: number): string {
    if (value == null || value <= 0) return '0 MB';

    if (value < 1) {
      const mb = value * 1024;
      return `${mb < 1 ? '0 MB' : mb.toFixed(1)} MB`;
    }

    if (value < 1024) {
      return Number.isInteger(value) ? `${value} GB` : `${value.toFixed(1)} GB`;
    }

    const tb = value / 1024;
    const rounded = Math.round(tb * 10) / 10;
    return Number.isInteger(rounded)
      ? `${rounded} TB`
      : `${rounded.toFixed(1)} TB`;
  }
}
