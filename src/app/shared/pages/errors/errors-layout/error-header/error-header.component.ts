import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RouterLink } from '@angular/router';

@Component({
  selector: 'error-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './error-header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorHeaderComponent {}
