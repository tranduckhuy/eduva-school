import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';

import { ButtonModule } from 'primeng/button';

import { SubmenuDirective } from '../../../../../shared/directives/submenu/submenu.directive';

import { ClassStudentManagementService } from '../../services/class-student-management.service';

import { type ClassModel } from '../../../../../shared/models/entities/class.model';
import { type StudentClassResponse } from '../../models/response/query/get-students-class-response.model';

@Component({
  selector: 'class-member',
  standalone: true,
  imports: [DatePipe, ButtonModule, SubmenuDirective],
  templateUrl: './class-member.component.html',
  styleUrl: './class-member.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClassMemberComponent {
  private readonly classStudentService = inject(ClassStudentManagementService);

  classModel = input<ClassModel | null>();
  students = input<StudentClassResponse[]>([]);

  removeStudent = output<void>();

  readonly openedMenuMemberId = signal<string | null>(null);

  onRemoveStudent(id: string) {
    const classId = this.classModel()?.id;

    if (!classId || !id) return;

    const request = [id];
    this.classStudentService
      .removeStudentFromClass(classId, request)
      .subscribe(() => this.removeStudent.emit());
  }

  toggleMenuMemberItem(id: string) {
    this.openedMenuMemberId.set(this.openedMenuMemberId() === id ? null : id);
  }
}
