import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'leadingZero',
  standalone: true,
})
export class LeadingZeroPipe implements PipeTransform {
  transform(value: number | string): string {
    const num = Number(value);
    if (isNaN(num)) {
      return value.toString();
    }
    return num > 0 && num < 10 ? '0' + num : num.toString();
  }
}
