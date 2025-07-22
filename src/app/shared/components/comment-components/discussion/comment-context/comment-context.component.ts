import {
  ChangeDetectionStrategy,
  Component,
  computed,
  OnInit,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { ImageModule } from 'primeng/image';

import { SubmenuDirective } from '../../../../directives/submenu/submenu.directive';
import { SafeHtmlPipe } from '../../../../pipes/safe-html.pipe';

import { UserService } from '../../../../services/api/user/user.service';
import { CommentService } from '../../comment-modal/services/comment.service';

import { UserCommentTextboxComponent } from '../../user-comment-textbox/user-comment-textbox.component';

import {
  type Reply,
  type CommentEntity,
} from '../../../../models/entities/comment.model';
import {
  type RenderBlock,
  ContentParserService,
} from '../../../../services/layout/content-parse/content-parse.service';

@Component({
  selector: 'comment-context',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    ImageModule,
    SubmenuDirective,
    SafeHtmlPipe,
    UserCommentTextboxComponent,
  ],
  templateUrl: './comment-context.component.html',
  styleUrl: './comment-context.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommentContextComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly commentService = inject(CommentService);
  private readonly contentParseService = inject(ContentParserService);

  comment = input<CommentEntity | null>(null);
  reply = input<Reply | null>(null);
  questionId = input<string>();
  isBestComment = input<boolean>(false);
  isReplyMode = input<boolean>();

  createCommentSuccess = output<void>();
  updateCommentSuccess = output<void>();
  deleteCommentSuccess = output<void>();

  user = this.userService.currentUser;

  isReplyTextboxOpen = signal<boolean>(false);
  isEditTextboxOpen = signal<boolean>(false);
  isOptionsOpen = signal<boolean>(false);
  contentBlocks = signal<RenderBlock[]>([]);

  readonly parentCommentId = computed(() =>
    this.isReplyMode() ? this.reply()?.parentCommentId : this.comment()?.id
  );

  canShowFooterOptions = computed(() => {
    const creatorId = !this.isReplyMode()
      ? this.comment()?.createdByUserId
      : this.reply()?.createdByUserId;
    const canUpdate = !this.isReplyMode()
      ? this.comment()?.canUpdate
      : this.reply()?.canUpdate;
    const canDelete = !this.isReplyMode()
      ? this.comment()?.canDelete
      : this.reply()?.canDelete;

    return creatorId && (canUpdate || canDelete);
  });

  mentionName = computed(() => {
    if (!this.user()) return null;

    const userId = this.user()?.id;

    if (this.isReplyMode()) {
      const reply = this.reply();
      return reply && reply.createdByUserId !== userId
        ? reply.createdByName
        : null;
    } else {
      const comment = this.comment();
      return comment && comment.createdByUserId !== userId
        ? comment.createdByName
        : null;
    }
  });

  readonly modifiedLabel = computed(() => {
    const isReply = this.isReplyMode();

    const modifiedAt = isReply
      ? this.reply()?.lastModifiedAt
      : this.comment()?.lastModifiedAt;

    return modifiedAt ? 'Đã chỉnh sửa' : '';
  });

  ngOnInit(): void {
    const rawContent = !this.isReplyMode()
      ? (this.comment()?.content ?? '')
      : (this.reply()?.content ?? '');
    this.contentParse(rawContent);
  }

  toggleReplyTextbox() {
    this.isReplyTextboxOpen.set(!this.isReplyTextboxOpen());
  }

  toggleEditTextbox() {
    this.closeFooterOptions();
    this.isEditTextboxOpen.set(!this.isEditTextboxOpen());
  }

  toggleFooterOptions() {
    this.isOptionsOpen.set(!this.isOptionsOpen());
  }

  closeFooterOptions() {
    this.isOptionsOpen.set(false);
  }

  onDeleteComment() {
    const commentId = !this.isReplyMode()
      ? this.comment()?.id
      : this.reply()?.id;

    if (!commentId) return;

    this.commentService.deleteComment(commentId).subscribe({
      next: () => {
        this.closeFooterOptions();
        this.deleteCommentSuccess.emit();
      },
    });
  }

  private contentParse(content: string) {
    this.contentBlocks.set(
      this.contentParseService.convertHtmlToBlocks(content)
    );
  }
}
