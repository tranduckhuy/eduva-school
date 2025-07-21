import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { UserService } from '../../../../../shared/services/api/user/user.service';

import { type AiJob } from '../../../../../shared/models/entities/ai-job.model';

@Component({
  selector: 'generate-lesson-card',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './generate-lesson-card.component.html',
  styleUrl: './generate-lesson-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenerateLessonCardComponent {
  private readonly userService = inject(UserService);

  job = input.required<AiJob>();

  user = this.userService.currentUser;
}
