import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
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
import { CommonModule } from '@angular/common';

import { ButtonModule } from 'primeng/button';

import { LoadingService } from '../../../../../shared/services/core/loading/loading.service';
import { QuestionService } from '../services/question.service';

import { noOnlySpacesValidator } from '../../../../utils/form-validators';

import { RichTextEditorComponent } from '../../../../../shared/components/rich-text-editor/rich-text-editor.component';

import { type Question } from '../../../../../shared/models/entities/question.model';
import { type CreateQuestionRequest } from '../model/request/command/create-question-request.model';
import { type UpdateQuestionRequest } from '../model/request/command/update-question-request.model';

@Component({
  selector: 'new-question',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    ButtonModule,
    RichTextEditorComponent,
  ],
  templateUrl: './new-question.component.html',
  styleUrl: './new-question.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewQuestionComponent {
  private readonly fb = inject(FormBuilder);
  private readonly loadingService = inject(LoadingService);
  private readonly questionService = inject(QuestionService);

  materialId = input.required<string>();
  questionToEdit = input<Question | null>();

  createQuestionSuccess = output<void>();
  updateQuestionSuccess = output<string>();
  cancelUpdateQuestion = output<string>();

  form: FormGroup;

  isLoading = this.loadingService.isLoading;

  content = signal<string>('');
  invalid = signal<boolean>(false);

  readonly isEditMode = computed(() => !!this.questionToEdit());

  constructor() {
    this.form = this.fb.group({
      title: ['', Validators.required],
      content: [''],
    });

    effect(
      () => {
        const question = this.questionToEdit();
        if (question) {
          this.patchForm(question);
        }
      },
      { allowSignalWrites: true }
    );
  }

  get title() {
    return this.form.get('title');
  }

  get contentControl() {
    return this.form.get('content');
  }

  getContent(content: string) {
    this.form.get('content')?.patchValue(content);
  }

  getErrorMessage(controlName: string): string {
    const control = this.form.get(controlName);
    if (control?.hasError('required')) return 'Trường này không được để trống';
    return '';
  }

  onSubmit() {
    this.form.markAllAsTouched();
    const lessonMaterialId = this.materialId();
    const title = this.title?.value;
    const content = this.contentControl?.value.trim();

    if (this.form.invalid || !title || !content) {
      this.invalid.set(true);
      return;
    }

    if (this.isEditMode() && this.questionToEdit()) {
      const request: UpdateQuestionRequest = {
        title,
        content,
      };
      this.questionService
        .updateQuestion(this.questionToEdit()!.id, request)
        .subscribe({
          next: question => {
            if (question) this.updateQuestionSuccess.emit(question?.id);
          },
        });
    } else {
      const request: CreateQuestionRequest = {
        lessonMaterialId,
        title,
        content,
      };
      this.questionService.createQuestion(request).subscribe({
        next: () => this.createQuestionSuccess.emit(),
      });
    }
  }

  patchForm(question: Question) {
    this.form.patchValue({
      title: question.title,
      content: question.content,
    });
    this.content.set(question.content);
  }
}
