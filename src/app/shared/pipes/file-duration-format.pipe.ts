import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'durationFormat',
  standalone: true,
})
export class FileDurationFormatPipe implements PipeTransform {
  transform(value: number, decimalPlaces: number = 2): string {
    if (value == null || isNaN(value) || value < 0) {
      return '';
    }

    const minutes = value / 60;
    return minutes === 0 ? '___' : minutes.toFixed(decimalPlaces) + ' phút';
  }
}
