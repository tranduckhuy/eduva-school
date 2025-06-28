import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { TabsModule } from 'primeng/tabs';

import { ClassInformationComponent } from './class-information/class-information.component';
import { ClassMemberComponent } from './class-member/class-member.component';

@Component({
  selector: 'app-class-detail',
  standalone: true,
  imports: [
    ButtonModule,
    TabsModule,
    ClassInformationComponent,
    ClassMemberComponent,
  ],
  templateUrl: './class-detail.component.html',
  styleUrl: './class-detail.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClassDetailComponent {}
