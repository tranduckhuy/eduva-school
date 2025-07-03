import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';

import { type ClassModel } from '../../../../../shared/models/entities/class.model';
import { type StudentClassResponse } from '../../models/response/query/get-students-class-response.model';

@Component({
  selector: 'class-member',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './class-member.component.html',
  styleUrl: './class-member.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClassMemberComponent {
  classModel = input<ClassModel | null>();
  students = input<StudentClassResponse[]>([]);
}
