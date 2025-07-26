import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';

import { ButtonModule } from 'primeng/button';

import { UserService } from '../../../services/api/user/user.service';
import { LoadingService } from '../../../services/core/loading/loading.service';
import { CommentService } from '../comment-modal/services/comment.service';

import { noOnlySpacesValidator } from '../../../utils/form-validators';

import { RichTextEditorComponent } from '../../rich-text-editor/rich-text-editor.component';

import { type CreateCommentRequest } from '../comment-modal/model/request/command/create-comment-request.model';
import { type UpdateCommentRequest } from '../comment-modal/model/request/command/update-comment-request.model';

@Component({
  selector: 'app-user-comment-textbox',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, RichTextEditorComponent],
  templateUrl: './user-comment-textbox.component.html',
  styleUrl: './user-comment-textbox.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserCommentTextboxComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly commentService = inject(CommentService);
  private readonly loadingService = inject(LoadingService);

  editCommentValue = input<string>();
  questionId = input<string>();
  commentId = input<string>();
  parentCommentId = input<string>();
  mention = input<string | null>(null);
  isReply = input<boolean>(false);
  isEdit = input<boolean>(false);

  createCommentSuccess = output<void>();
  updateCommentSuccess = output<void>();
  cancel = output<void>();

  form: FormGroup;

  user = this.userService.currentUser;
  isLoadingCreate = this.loadingService.is('create-comment');
  isLoadingUpdate = this.loadingService.is('update-comment');

  commentValue = signal<string>('');
  invalid = signal<boolean>(false);

  constructor() {
    this.form = this.fb.group({
      content: ['', [Validators.required, noOnlySpacesValidator]],
    });
  }

  ngOnInit(): void {
    const value = this.isEdit()
      ? (this.editCommentValue() ?? '')
      : this.mentionValue;

    this.commentValue.set(value);
    this.content?.patchValue(value);
  }

  get content() {
    return this.form.get('content');
  }

  get mentionValue() {
    return this.isReply() && this.mention()
      ? `<p><span class="mention" id="mention" data-mention="@${this.mention()}">@${this.mention()}</span>&nbsp;</p>`
      : '';
  }

  onSubmit() {
    this.form.markAllAsTouched();

    const content = this.content?.value.trim();

    if (this.form.invalid || !content) {
      this.invalid.set(true);
      return;
    }

    if (this.isEdit()) {
      const commentId = this.commentId();
      if (!commentId) return;

      const request: UpdateCommentRequest = { content };
      this.commentService.updateComment(commentId, request).subscribe({
        next: comment => {
          if (comment) {
            this.resetForm();
            this.updateCommentSuccess.emit();
            this.cancel.emit();
          }
        },
      });
    } else {
      const questionId = this.questionId();
      if (!questionId) return;

      let request: CreateCommentRequest = {
        questionId,
        content,
      };

      if (this.isReply()) {
        request = {
          ...request,
          parentCommentId: this.parentCommentId(),
        };
      }

      this.commentService.createComment(request).subscribe({
        next: comment => {
          if (comment) {
            this.resetForm();
            this.createCommentSuccess.emit();
            this.cancel.emit();
          }
        },
      });
    }
  }

  getContent(content: string) {
    this.content?.patchValue(content);
  }

  getErrorMessage(controlName: string): string {
    const control = this.form.get(controlName);
    if (control?.hasError('required')) return 'Trường này không được để trống';
    return '';
  }

  private resetForm() {
    this.commentValue.set('');
    this.form.reset();
    this.form.updateValueAndValidity();
  }
}
