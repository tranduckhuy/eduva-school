import { Pipe, PipeTransform } from '@angular/core';

type StorageUnit = 'kb' | 'mb' | 'gb' | 'tb';

@Pipe({
  name: 'storageFormat',
  standalone: true,
})
export class StorageFormatPipe implements PipeTransform {
  transform(
    value: number | undefined | null,
    type: StorageUnit = 'gb'
  ): string {
    const typeUppercase = type.toUpperCase();

    if (!value) return '0 ' + typeUppercase;

    if (type === 'gb') {
      if (value >= 1024) {
        const tb = value / 1024;
        return `${tb.toFixed(1)} ${typeUppercase}`;
      }
      return `${value} ${typeUppercase}`;
    } else {
      if (value >= 1024) {
        const gb = value / 1024;
        return `${gb.toFixed(1)} ${typeUppercase}`;
      }
      return `${value} ${typeUppercase}`;
    }
  }
}
