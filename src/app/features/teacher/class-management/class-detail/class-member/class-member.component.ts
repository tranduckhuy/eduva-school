import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'class-member',
  standalone: true,
  imports: [],
  templateUrl: './class-member.component.html',
  styleUrl: './class-member.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClassMemberComponent {}
