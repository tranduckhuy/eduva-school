import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

import { QuestionComponent } from '../../question/question.component';
import { DiscussionComponent } from '../../discussion/discussion.component';

import { type Question } from '../../../../../shared/models/entities/question.model';

@Component({
  selector: 'comment-content',
  standalone: true,
  imports: [QuestionComponent, DiscussionComponent],
  templateUrl: './comment-content.component.html',
  styleUrl: './comment-content.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommentContentComponent {
  question = input.required<Question | null>();

  createCommentSuccess = output<string>();
  updateCommentSuccess = output<string>();
  deleteCommentSuccess = output<string>();
  editQuestion = output<Question | null>();
  deleteQuestion = output<void>();
}
