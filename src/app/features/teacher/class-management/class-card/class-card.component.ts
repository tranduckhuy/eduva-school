import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'class-card',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './class-card.component.html',
  styleUrl: './class-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClassCardComponent {}
