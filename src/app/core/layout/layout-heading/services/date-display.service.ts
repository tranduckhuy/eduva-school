import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DateDisplayService {
  private readonly showDateSignal = signal<boolean>(false);
  showDate = this.showDateSignal.asReadonly();

  setShowDate(value: boolean) {
    this.showDateSignal.set(value);
  }
}
