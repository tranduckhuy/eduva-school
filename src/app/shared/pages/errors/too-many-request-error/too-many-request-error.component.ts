import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-too-many-request-error',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './too-many-request-error.component.html',
  styleUrl: './too-many-request-error.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooManyRequestErrorComponent {}
