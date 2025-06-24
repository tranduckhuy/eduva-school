import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ButtonModule } from 'primeng/button';

import { PersonalProfileComponent } from './personal-profile/personal-profile.component';
import { PersonalContactComponent } from './personal-contact/personal-contact.component';

@Component({
  selector: 'app-personal-information',
  standalone: true,
  imports: [ButtonModule, PersonalProfileComponent, PersonalContactComponent],
  templateUrl: './personal-information.component.html',
  styleUrl: './personal-information.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PersonalInformationComponent {}
