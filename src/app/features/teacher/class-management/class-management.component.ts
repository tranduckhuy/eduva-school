import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { ClassCardComponent } from './class-card/class-card.component';
import { SearchInputComponent } from '../../../shared/components/search-input/search-input.component';

@Component({
  selector: 'app-class-management',
  standalone: true,
  imports: [ButtonModule, ClassCardComponent, SearchInputComponent],
  templateUrl: './class-management.component.html',
  styleUrl: './class-management.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClassManagementComponent {}
