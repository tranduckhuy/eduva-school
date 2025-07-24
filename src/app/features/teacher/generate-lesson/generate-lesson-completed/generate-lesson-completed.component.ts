import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';

import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { GenerateLessonCardComponent } from './generate-lesson-card/generate-lesson-card.component';

import { AiJobCompletedService } from './services/ai-job-completed.service';

import { type GetAiJobCompletedRequest } from './models/get-job-completed-request.model';

@Component({
  selector: 'app-generate-lesson-completed',
  standalone: true,
  imports: [
    RouterLink,
    ButtonModule,
    PaginatorModule,
    ButtonComponent,
    GenerateLessonCardComponent,
  ],
  templateUrl: './generate-lesson-completed.component.html',
  styleUrl: './generate-lesson-completed.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenerateLessonCompletedComponent implements OnInit {
  private readonly aiJobCompletedService = inject(AiJobCompletedService);

  jobList = this.aiJobCompletedService.jobList;
  totalJobs = this.aiJobCompletedService.totalJobs;

  currentPage = signal<number>(1);
  rows = signal<number>(11);
  first = signal<number>(0);

  ngOnInit(): void {
    this.loadJob();
  }

  onPageChange(event: PaginatorState) {
    this.first.set(event.first ?? 0);
    this.rows.set(event.rows ?? 11);

    const page = this.first() / this.rows() + 1;
    this.currentPage.set(page);

    this.loadJob();
  }

  private loadJob() {
    const request: GetAiJobCompletedRequest = {
      pageIndex: this.currentPage(),
      pageSize: this.rows(),
      sortBy: 'createdAt',
      sortDirection: 'desc',
      isPagingEnabled: true,
    };
    this.aiJobCompletedService.getAiJobCompleted(request).subscribe();
  }
}
