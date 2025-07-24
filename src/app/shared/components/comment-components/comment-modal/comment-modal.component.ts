import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  DestroyRef,
  effect,
  inject,
  input,
  output,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { forkJoin } from 'rxjs';

import { QuestionService } from './services/question.service';

import { CommentListComponent } from './comment-list/comment-list.component';
import { CommentContentComponent } from './comment-content/comment-content.component';
import { NewQuestionComponent } from './new-question/new-question.component';

import { type Question } from '../../../models/entities/question.model';
import { type GetQuestionsRequest } from './model/request/query/get-questions-request.model';

@Component({
  selector: 'comment-modal',
  standalone: true,
  imports: [
    CommonModule,
    CommentListComponent,
    CommentContentComponent,
    NewQuestionComponent,
  ],
  templateUrl: './comment-modal.component.html',
  styleUrl: './comment-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommentModalComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly questionService = inject(QuestionService);

  materialId = input.required<string>();
  materialTitle = input.required<string>();
  visible = input.required<boolean>();

  questionIdFromNotification = input<string>('');

  closeCommentDrawer = output<void>();

  // ? Question list
  lessonQuestions = signal<Question[]>([]);
  myQuestions = signal<Question[]>([]);

  // ? Single Question
  question = signal<Question | null>(null);
  editQuestion = signal<Question | null>(null);

  // ? Question pagination
  totalLessonQuestions = signal<number>(0);
  totalMyQuestions = signal<number>(0);
  currentLessonQuestionPage = signal<number>(1);
  currentMyQuestionPage = signal<number>(1);
  lessonQuestionPageSize = signal<number>(8);
  myQuestionPageSize = signal<number>(8);

  // ? Loading State
  isLoading = signal<boolean>(false);

  // ? State management
  hasFetchedOnce = signal(false);
  currentState = signal<'list' | 'content' | 'question'>('list');

  paginationLessonPages = computed(() =>
    this.generatePaginationPages(
      this.currentLessonQuestionPage(),
      Math.ceil(this.totalLessonQuestions() / this.lessonQuestionPageSize())
    )
  );

  paginationMyPages = computed(() =>
    this.generatePaginationPages(
      this.currentMyQuestionPage(),
      Math.ceil(this.totalMyQuestions() / this.myQuestionPageSize())
    )
  );

  totalLessonQuestionPages = computed(() =>
    Math.ceil(this.totalLessonQuestions() / this.lessonQuestionPageSize())
  );

  totalMyQuestionPages = computed(() =>
    Math.ceil(this.totalMyQuestions() / this.myQuestionPageSize())
  );

  constructor() {
    effect(
      () => {
        if (this.visible() && !this.hasFetchedOnce()) {
          this.fetchAllQuestions();
          this.hasFetchedOnce.set(true);
        }
      },
      { allowSignalWrites: true }
    );

    effect(
      () => {
        const totalPages = this.totalLessonQuestionPages();
        const currentPage = this.currentLessonQuestionPage();

        if (currentPage > totalPages) {
          this.currentLessonQuestionPage.set(Math.max(1, totalPages));
        }
      },
      { allowSignalWrites: true }
    );

    this.destroyRef.onDestroy(() => this.hasFetchedOnce.set(false));
  }

  ngOnInit(): void {
    if (this.questionIdFromNotification()) {
      this.handleViewQuestion(this.questionIdFromNotification());
    }
  }

  handleViewQuestion(questionId: string) {
    this.fetchQuestionById(questionId);
  }

  handleAddNewQuestion() {
    this.currentState.set('question');
  }

  handleGoBack() {
    this.currentState.set('list');
  }

  closeModal() {
    this.closeCommentDrawer.emit();
  }

  onChangeLessonPage(page: number | string) {
    this.currentLessonQuestionPage.set(+page);
    this.fetchLessonQuestions();
  }

  onChangeMyPage(page: number | string) {
    this.currentMyQuestionPage.set(+page);
    this.fetchMyQuestions();
  }

  onCreateQuestion() {
    this.fetchAllQuestions();
    this.currentState.set('list');
  }

  onUpdateQuestionPrefill(question: Question | null) {
    this.editQuestion.set(question);
    this.currentState.set('question');
  }

  onUpdateQuestion(questionId: string) {
    this.editQuestion.set(null);
    this.handleViewQuestion(questionId);
  }

  onDeleteQuestion() {
    this.fetchAllQuestions();
    this.currentState.set('list');
  }

  private fetchAllQuestions() {
    this.isLoading.set(true);

    const lessonQuestionsRequest: GetQuestionsRequest = {
      pageIndex: this.currentLessonQuestionPage(),
      pageSize: this.lessonQuestionPageSize(),
      sortBy: 'createdAt',
      sortDirection: 'desc',
    };

    const myQuestionsRequest: GetQuestionsRequest = {
      pageIndex: this.currentMyQuestionPage(),
      pageSize: this.myQuestionPageSize(),
      sortBy: 'createdAt',
      sortDirection: 'desc',
    };

    forkJoin({
      lessonQuestionsRes: this.questionService.getLessonQuestions(
        this.materialId(),
        lessonQuestionsRequest
      ),
      myQuestionsRes: this.questionService.getMyQuestions(myQuestionsRequest),
    }).subscribe({
      next: ({ lessonQuestionsRes, myQuestionsRes }) => {
        if (lessonQuestionsRes) {
          this.lessonQuestions.set(lessonQuestionsRes.data);
          this.totalLessonQuestions.set(lessonQuestionsRes.count);
        }

        if (myQuestionsRes) {
          this.myQuestions.set(myQuestionsRes.data);
          this.totalMyQuestions.set(myQuestionsRes.count);
        }
      },
      complete: () => {
        this.isLoading.set(false);
        this.currentState.set('list');
      },
    });
  }

  private fetchLessonQuestions() {
    this.isLoading.set(true);

    const req: GetQuestionsRequest = {
      pageIndex: this.currentLessonQuestionPage(),
      pageSize: this.lessonQuestionPageSize(),
      sortBy: 'createdAt',
      sortDirection: 'desc',
    };

    this.questionService.getLessonQuestions(this.materialId(), req).subscribe({
      next: res => {
        if (res) {
          this.lessonQuestions.set(res.data);
          this.totalLessonQuestions.set(res.count);
        }
      },
      complete: () => this.isLoading.set(false),
    });
  }

  private fetchMyQuestions() {
    this.isLoading.set(true);

    const req: GetQuestionsRequest = {
      pageIndex: this.currentMyQuestionPage(),
      pageSize: this.myQuestionPageSize(),
      sortBy: 'createdAt',
      sortDirection: 'desc',
    };

    this.questionService.getMyQuestions(req).subscribe({
      next: res => {
        if (res) {
          this.myQuestions.set(res.data);
          this.totalMyQuestions.set(res.count);
        }
      },
      complete: () => this.isLoading.set(false),
    });
  }

  private fetchQuestionById(questionId: string) {
    this.isLoading.set(true);

    this.questionService.getQuestionById(questionId).subscribe({
      next: question => {
        if (question) {
          this.question.set(question);
          this.currentState.set('content');
        }
      },
      complete: () => this.isLoading.set(false),
    });
  }

  private generatePaginationPages(
    currentPage: number,
    totalPages: number
  ): (number | string)[] {
    const pages: (number | string)[] = [];

    if (totalPages <= 8) {
      // Display all if total pages less than 8
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    // First page
    pages.push(1);
    pages.push(2);

    if (currentPage <= 4) {
      for (let i = 3; i <= 6; i++) pages.push(i);
      pages.push('...');
    } else if (currentPage >= totalPages - 3) {
      pages.push('...');
      for (let i = totalPages - 5; i <= totalPages - 2; i++) pages.push(i);
    } else {
      pages.push('...');
      pages.push(currentPage - 1);
      pages.push(currentPage);
      pages.push(currentPage + 1);
      pages.push('...');
    }

    // Last page
    pages.push(totalPages - 1);
    pages.push(totalPages);

    return pages;
  }
}
