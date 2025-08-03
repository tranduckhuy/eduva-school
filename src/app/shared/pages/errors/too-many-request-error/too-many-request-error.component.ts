import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-too-many-request-error',
  standalone: true,
  imports: [],
  templateUrl: './too-many-request-error.component.html',
  styleUrl: './too-many-request-error.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TooManyRequestErrorComponent {

}
