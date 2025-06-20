import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'bytesToReadable',
  standalone: true,
})
export class BytesToReadablePipe implements PipeTransform {
  private readonly sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  transform(bytes: number, unit: string = 'MB', decimals: number = 2): string {
    if (bytes === 0) return `0 ${unit}`;
    if (bytes < 0) return 'Invalid size';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;

    // Find index of unit, default to MB if not found
    const unitIndex = this.sizes.indexOf(unit);
    const index = unitIndex !== -1 ? unitIndex : 2; // 2 is MB

    const size = parseFloat((bytes / Math.pow(k, index)).toFixed(dm));

    return `${size} ${this.sizes[index]}`;
  }
}
