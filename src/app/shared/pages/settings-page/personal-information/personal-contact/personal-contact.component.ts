import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormControlComponent } from '../../../../components/form-control/form-control.component';

@Component({
  selector: 'personal-contact',
  standalone: true,
  imports: [FormControlComponent],
  templateUrl: './personal-contact.component.html',
  styleUrl: './personal-contact.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PersonalContactComponent {
  isEdit = input.required<boolean>();
}
