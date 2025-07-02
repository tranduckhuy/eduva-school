import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-internal-error',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './internal-error.component.html',
  styleUrl: './internal-error.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InternalErrorComponent {}
