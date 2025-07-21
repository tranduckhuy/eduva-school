import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';

import { TableEmptyStateComponent } from '../../../../shared/components/table-empty-state/table-empty-state.component';
import { DashboardTeacherResponse } from '../../../../shared/models/api/response/query/dashboard-teacher-response.model';

@Component({
  selector: 'app-unanswer-questions',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    RouterLink,
    TooltipModule,
    TableEmptyStateComponent,
  ],
  templateUrl: './unanswer-questions.component.html',
  styleUrl: './unanswer-questions.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnanswerQuestionsComponent {
  readonly questions =
    input.required<DashboardTeacherResponse['unAnswerQuestions']>();
}
