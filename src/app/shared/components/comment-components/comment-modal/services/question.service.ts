import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

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
        request
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
      .get<GetQuestionsResponse>(this.GET_MY_QUESTIONS_API_URL, request)
      .pipe(
        map(res => this.extractDataResponse<GetQuestionsResponse>(res)),
        catchError((err: HttpErrorResponse) => this.handleError(err))
      );
  }

  getQuestionById(questionId: string): Observable<Question | null> {
    return this.requestService
      .get<Question>(`${this.BASE_QUESTION_API_URL}/${questionId}`)
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
    this.toastHandlingService.errorGeneral();
    return throwError(() => err);
  }
}
