import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { ButtonModule } from 'primeng/button';

import { type Question } from '../../../../models/entities/question.model';
import { ButtonOutlineGradientComponent } from '../../../button-outline-gradient/button-outline-gradient.component';

@Component({
  selector: 'comment-list',
  standalone: true,
  imports: [CommonModule, ButtonModule, ButtonOutlineGradientComponent],
  templateUrl: './comment-list.component.html',
  styleUrl: './comment-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommentListComponent {
  materialTitle = input.required<string>();

  // ? Question List
  lessonQuestions = input.required<Question[]>();
  myQuestions = input.required<Question[]>();
  totalLessonQuestions = input.required<number>();
  totalMyQuestions = input.required<number>();

  // ? Lesson Question Paging
  currentLessonPage = input.required<number>();
  totalLessonQuestionPages = input.required<number>();
  lessonQuestionPages = input.required<(number | string)[]>();

  // ? My Question Paging
  currentMyPage = input.required<number>();
  totalMyQuestionPages = input.required<number>();
  myQuestionPages = input.required<(number | string)[]>();

  changeLessonPage = output<number | string>();
  changeMyPage = output<number | string>();

  viewComment = output<string>();
  newQuestion = output<void>();

  isNumber(value: unknown): value is number {
    return typeof value === 'number';
  }

  onSelectQuestion(id: string) {
    this.viewComment.emit(id);
  }
}
