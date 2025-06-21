import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LayoutHeadingService {
  private readonly headingSignal = signal<string>('');
  heading = this.headingSignal.asReadonly();

  setHeading(value: string) {
    this.headingSignal.set(value);
  }
}
