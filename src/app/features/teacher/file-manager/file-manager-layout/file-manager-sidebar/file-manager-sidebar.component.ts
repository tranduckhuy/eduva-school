import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  effect,
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

  fileStorage = this.fileStorageService.fileStorage;

  usedStorage = signal<number>(0);
  limitStorage = signal<number>(0);
  usagePercentage = signal<number>(0);

  tooltipText = computed(() => {
    return `${this.formatStorage(this.usedStorage())} / ${this.formatStorage(this.limitStorage())}`;
  });

  constructor() {
    effect(
      () => {
        const fileStorage = this.fileStorage();
        if (!fileStorage) return;

        const used = fileStorage.usedBytes;
        const limit = fileStorage.limitBytes;

        this.usedStorage.set(used);
        this.limitStorage.set(limit);

        const percent =
          limit === 0
            ? 0
            : Math.min(100, Math.round((used / limit) * 10000) / 100);
        this.usagePercentage.set(percent);
      },
      { allowSignalWrites: true }
    );
  }

  ngOnInit(): void {
    this.fileStorageService.getFileStorageQuota().subscribe({
      next: res => {
        if (res) {
          this.usedStorage.set(res.usedBytes);
          this.limitStorage.set(res.limitBytes);
        }
      },
    });
  }

  formatStorage(bytes: number): string {
    if (!bytes || bytes <= 0) return '0 MB';

    const KB = 1024;
    const MB = KB * 1024;
    const GB = MB * 1024;
    const TB = GB * 1024;

    const format = (val: number, unit: string): string =>
      Number.isInteger(val) ? `${val} ${unit}` : `${val.toFixed(1)} ${unit}`;

    if (bytes < MB) return '0 MB';
    if (bytes < GB) return format(bytes / MB, 'MB');
    if (bytes < TB) return format(bytes / GB, 'GB');

    return format(bytes / TB, 'TB');
  }
}
