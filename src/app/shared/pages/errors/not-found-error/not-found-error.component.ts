import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found-error',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './not-found-error.component.html',
  styleUrl: './not-found-error.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundErrorComponent {}
