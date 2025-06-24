import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControlComponent } from '../../../../components/form-control/form-control.component';

@Component({
  selector: 'personal-profile',
  standalone: true,
  imports: [FormControlComponent],
  templateUrl: './personal-profile.component.html',
  styleUrl: './personal-profile.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PersonalProfileComponent {}
