import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

@Component({
  selector: 'error-footer',
  standalone: true,
  imports: [],
  templateUrl: './error-footer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorFooterComponent {
  currentYear = signal(new Date().getFullYear());

  constructor() {
    this.scheduleYearUpdate();
  }

  private scheduleYearUpdate() {
    const now = new Date();
    const nextYear = new Date(now.getFullYear() + 1, 0, 1);
    const msUntilNextYear = nextYear.getTime() - now.getTime();

    setTimeout(() => {
      this.currentYear.set(new Date().getFullYear());
      this.scheduleYearUpdate();
    }, msUntilNextYear);
  }
}
