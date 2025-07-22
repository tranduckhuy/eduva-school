import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';

import { UserCommentTextboxComponent } from '../user-comment-textbox/user-comment-textbox.component';
import { CommentContextComponent } from './comment-context/comment-context.component';

import { type Question } from '../../../models/entities/question.model';

@Component({
  selector: 'comment-discussion',
  standalone: true,
  imports: [UserCommentTextboxComponent, CommentContextComponent],
  templateUrl: './discussion.component.html',
  styleUrl: './discussion.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiscussionComponent {
  question = input.required<Question | null>();

  createCommentSuccess = output<void>();
  updateCommentSuccess = output<void>();
  deleteCommentSuccess = output<void>();

  comment = signal<string>('');

  readonly commentWithMostReplies = computed(() => {
    const comments = this.question()?.comments ?? [];

    const filtered = comments.filter(c => c.replyCount > 0);
    if (filtered.length === 0) return null;

    return filtered.reduce((max, current) =>
      current.replyCount > max.replyCount ? current : max
    );
  });
}
