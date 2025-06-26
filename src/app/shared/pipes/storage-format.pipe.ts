import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'storageFormat',
  standalone: true,
})
export class StorageFormatPipe implements PipeTransform {
  transform(gb: number): string {
    if (gb >= 1024) {
      const tb = gb / 1024;
      return `${tb.toFixed(1)} TB`;
    }
    return `${gb} GB`;
  }
}
