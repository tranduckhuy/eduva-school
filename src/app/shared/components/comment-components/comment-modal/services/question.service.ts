import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

import { Observable, map, catchError, throwError, tap } from 'rxjs';

import { environment } from '../../../../../../environments/environment';

import { RequestService } from '../../../../../shared/services/core/request/request.service';
import { ToastHandlingService } from '../../../../../shared/services/core/toast/toast-handling.service';

import { StatusCode } from '../../../../../shared/constants/status-code.constant';

import { type Question } from '../../../../../shared/models/entities/question.model';
import { type GetQuestionsRequest } from '../model/request/query/get-questions-request.model';
import { type GetQuestionsResponse } from '../model/response/query/get-questions-response.model';
import { type CreateQuestionRequest } from '../model/request/command/create-question-request.model';
import { type UpdateQuestionRequest } from '../model/request/command/update-question-request.model';

@Injectable({
  providedIn: 'root',
})
export class QuestionService {
  private readonly router = inject(Router);
  private readonly requestService = inject(RequestService);
  private readonly toastHandlingService = inject(ToastHandlingService);

  private readonly BASE_API_URL = environment.baseApiUrl;
  private readonly BASE_QUESTION_API_URL = `${this.BASE_API_URL}/questions`;
  private readonly GET_LESSON_QUESTIONS_API_URL = `${this.BASE_QUESTION_API_URL}/lesson`;
  private readonly GET_MY_QUESTIONS_API_URL = `${this.BASE_QUESTION_API_URL}/my-questions`;

  getLessonQuestions(
    materialId: string,
    request?: GetQuestionsRequest
  ): Observable<GetQuestionsResponse | null> {
    return this.requestService
      .get<GetQuestionsResponse>(
        `${this.GET_LESSON_QUESTIONS_API_URL}/${materialId}`,
        request,
        {
          bypassAuthError: true,
        }
      )
      .pipe(
        map(res => this.extractDataResponse<GetQuestionsResponse>(res)),
        catchError((err: HttpErrorResponse) => this.handleError(err))
      );
  }

  getMyQuestions(
    request: GetQuestionsRequest
  ): Observable<GetQuestionsResponse | null> {
    return this.requestService
      .get<GetQuestionsResponse>(this.GET_MY_QUESTIONS_API_URL, request, {
        bypassAuthError: true,
      })
      .pipe(
        map(res => this.extractDataResponse<GetQuestionsResponse>(res)),
        catchError((err: HttpErrorResponse) => this.handleError(err))
      );
  }

  getQuestionById(questionId: string): Observable<Question | null> {
    return this.requestService
      .get<Question>(`${this.BASE_QUESTION_API_URL}/${questionId}`, {
        bypassNotFoundError: true,
      })
      .pipe(
        map(res => this.extractDataResponse<Question>(res)),
        catchError((err: HttpErrorResponse) => this.handleError(err))
      );
  }

  createQuestion(request: CreateQuestionRequest): Observable<Question | null> {
    return this.requestService
      .post<Question>(this.BASE_QUESTION_API_URL, request)
      .pipe(
        tap(res => this.handleQuestionResponse(res)),
        map(res => this.extractDataResponse<Question>(res)),
        catchError((err: HttpErrorResponse) => this.handleError(err))
      );
  }

  updateQuestion(
    questionId: string,
    request: UpdateQuestionRequest
  ): Observable<Question | null> {
    return this.requestService
      .put<Question>(`${this.BASE_QUESTION_API_URL}/${questionId}`, request)
      .pipe(
        tap(res => this.handleQuestionResponse(res)),
        map(res => this.extractDataResponse<Question>(res)),
        catchError((err: HttpErrorResponse) => this.handleError(err))
      );
  }

  deleteQuestion(questionId: string): Observable<void> {
    return this.requestService
      .delete(`${this.BASE_QUESTION_API_URL}/${questionId}`)
      .pipe(
        tap(res => this.handleDeleteResponse(res)),
        map(() => void 0),
        catchError((err: HttpErrorResponse) => this.handleError(err))
      );
  }

  // ---------------------------
  //  Private Helper Functions
  // ---------------------------

  private handleQuestionResponse(res: any): void {
    if (
      (res.statusCode === StatusCode.SUCCESS ||
        res.statusCode === StatusCode.CREATED) &&
      res.data
    ) {
      this.toastHandlingService.successGeneral();
    } else {
      this.toastHandlingService.errorGeneral();
    }
  }

  private handleDeleteResponse(res: any): void {
    if (res.statusCode === StatusCode.SUCCESS) {
      this.toastHandlingService.successGeneral();
    } else {
      this.toastHandlingService.errorGeneral();
    }
  }

  private extractDataResponse<T>(res: any): T | null {
    if (
      (res.statusCode === StatusCode.SUCCESS ||
        res.statusCode === StatusCode.CREATED) &&
      res.data
    ) {
      return res.data as T;
    }
    return null;
  }

  private handleError(err: HttpErrorResponse) {
    const statusCode = err.error?.statusCode;

    if (this.isRedirectRequired(statusCode)) {
      this.handleRedirectError(statusCode);
    } else {
      this.handleNonRedirectError(statusCode);
    }

    return throwError(() => err);
  }

  private isRedirectRequired(statusCode: number): boolean {
    const redirectCodes = [
      StatusCode.LESSON_MATERIAL_NOT_ACTIVE,
      StatusCode.STUDENT_NOT_IN_SCHOOL_CLASS,
      StatusCode.STUDENT_NOT_ENROLLED_IN_CLASS_WITH_MATERIAL,
      StatusCode.QUESTION_NOT_ACCESSIBLE,
    ];
    return redirectCodes.includes(statusCode as any);
  }

  private handleRedirectError(statusCode: number): void {
    setTimeout(() => {
      this.router.navigate(['/']);
    }, 2000);

    window.dispatchEvent(new Event('close-all-submenus'));

    this.showRedirectToast(statusCode);
  }

  private handleNonRedirectError(statusCode: number): void {
    switch (statusCode) {
      case StatusCode.QUESTION_NOT_FOUND:
        this.toastHandlingService.warn(
          'Câu hỏi không tồn tại',
          'Câu hỏi đã bị người đăng xóa hoặc không tồn tại.'
        );
        break;
      case StatusCode.QUESTION_NOT_ACTIVE:
      default:
        this.toastHandlingService.errorGeneral();
    }
  }

  private showRedirectToast(statusCode: number): void {
    const toastConfig = this.getToastConfig(statusCode);
    this.toastHandlingService.warn(toastConfig.title, toastConfig.message);
  }

  private getToastConfig(statusCode: number): {
    title: string;
    message: string;
  } {
    const configs: Record<number, { title: string; message: string }> = {
      [StatusCode.LESSON_MATERIAL_NOT_ACTIVE]: {
        title: 'Bài giảng đã bị xóa',
        message:
          'Bài giảng đã bị giáo viên sở hữu chuyển vào thùng rác hoặc xóa.',
      },
      [StatusCode.STUDENT_NOT_IN_SCHOOL_CLASS]: {
        title: 'Lớp học đã bị xóa',
        message: 'Lớp học đã bị giáo viên sở hữu lưu trữ hoặc xóa.',
      },
      [StatusCode.STUDENT_NOT_ENROLLED_IN_CLASS_WITH_MATERIAL]: {
        title: 'Không thể truy cập bài giảng',
        message:
          'Bài giảng đã bị giáo viên sở hữu chuyển vào thùng rác hoặc xóa.',
      },
      [StatusCode.QUESTION_NOT_ACCESSIBLE]: {
        title: 'Bài giảng đã bị xóa',
        message: 'Bài giảng đã bị giáo viên xóa khỏi lớp học.',
      },
    };

    return configs[statusCode] || { title: '', message: '' };
  }
}
