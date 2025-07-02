import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ErrorHeaderComponent } from './error-header/error-header.component';
import { ErrorFooterComponent } from './error-footer/error-footer.component';

@Component({
  selector: 'app-errors-layout',
  standalone: true,
  imports: [RouterOutlet, ErrorHeaderComponent, ErrorFooterComponent],
  template: `
    <div class="flex min-h-screen flex-col">
      <error-header />

      <main class="flex grow items-center justify-center text-center">
        <router-outlet />
      </main>

      <error-footer />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorsLayoutComponent {}
