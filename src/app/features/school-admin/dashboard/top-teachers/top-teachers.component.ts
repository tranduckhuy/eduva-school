import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';

import { type DashboardSchoolAdminResponse } from '../../../../shared/models/api/response/query/dashboard-sa-response.model';

@Component({
  selector: 'app-top-teachers',
  standalone: true,
  imports: [CommonModule, TableModule, RouterLink, TooltipModule],
  templateUrl: './top-teachers.component.html',
  styleUrl: './top-teachers.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopTeachersComponent {
  teachers = input.required<DashboardSchoolAdminResponse['topTeachers']>();
}
