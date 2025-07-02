import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-unauthorized-error',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './unauthorized-error.component.html',
  styleUrl: './unauthorized-error.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnauthorizedErrorComponent {}
