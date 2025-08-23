import { Pipe, PipeTransform } from '@angular/core';

type StorageUnit = 'kb' | 'mb' | 'gb' | 'tb';

@Pipe({
  name: 'storageFormat',
  standalone: true,
})
export class StorageFormatPipe implements PipeTransform {
  transform(value: number | null | undefined, cap: StorageUnit = 'gb'): string {
    if (!value) return `0 ${cap.toUpperCase()}`;

    const toSmart = (n: number) =>
      Number.isInteger(n) ? String(n) : n.toFixed(1);

    switch (cap) {
      case 'tb': // ? If value is GB
        if (value >= 1024) {
          const tb = value / 1024; // ? GB -> TB
          return `${toSmart(tb)} TB`;
        }
        return `${toSmart(value)} GB`;

      case 'gb': // ? If value is MB
        if (value >= 1024) {
          const gb = value / 1024; // ? MB -> GB
          return `${toSmart(gb)} GB`;
        }
        return `${toSmart(value)} MB`;

      case 'mb': // ? If value is KB
        if (value >= 1024) {
          const mb = value / 1024; // ? KB -> MB
          return `${toSmart(mb)} MB`;
        }
        return `${toSmart(value)} KB`;

      case 'kb':
      default:
        return `${toSmart(value)} KB`;
    }
  }
}
