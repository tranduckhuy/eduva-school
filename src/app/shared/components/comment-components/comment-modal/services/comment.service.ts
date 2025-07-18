import { inject, Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { Observable, map, tap, catchError, throwError } from 'rxjs';

import { environment } from '../../../../../../environments/environment';

import { RequestService } from '../../../../../shared/services/core/request/request.service';
import { ToastHandlingService } from '../../../../../shared/services/core/toast/toast-handling.service';

import { StatusCode } from '../../../../../shared/constants/status-code.constant';

import { type CommentEntity } from '../../../../../shared/models/entities/comment.model';
import { type CreateCommentRequest } from '../model/request/command/create-comment-request.model';
import { type UpdateCommentRequest } from '../model/request/command/update-comment-request.model';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private readonly requestService = inject(RequestService);
  private readonly toastHandlingService = inject(ToastHandlingService);

  private readonly BASE_API_URL = environment.baseApiUrl;
  private readonly BASE_COMMENT_API_URL = `${this.BASE_API_URL}/questions/comments`;

  createComment(
    request: CreateCommentRequest
  ): Observable<CommentEntity | null> {
    return this.requestService
      .post(this.BASE_COMMENT_API_URL, request, {
        loadingKey: 'create-comment',
      })
      .pipe(
        tap(res => this.handleCommentResponse(res)),
        map(res => this.extractDataResponse(res)),
        catchError((err: HttpErrorResponse) => this.handleError(err))
      );
  }

  updateComment(
    commentId: string,
    request: UpdateCommentRequest
  ): Observable<CommentEntity | null> {
    return this.requestService
      .put(`${this.BASE_COMMENT_API_URL}/${commentId}`, request, {
        loadingKey: 'update-comment',
      })
      .pipe(
        tap(res => this.handleCommentResponse(res)),
        map(res => this.extractDataResponse(res)),
        catchError((err: HttpErrorResponse) => this.handleError(err))
      );
  }

  deleteComment(commentId: string): Observable<void> {
    return this.requestService
      .delete(`${this.BASE_COMMENT_API_URL}/${commentId}`)
      .pipe(
        tap(res => this.handleDeleteResponse(res)),
        map(() => void 0),
        catchError((err: HttpErrorResponse) => this.handleError(err))
      );
  }

  // ---------------------------
  //  Private Helper Functions
  // ---------------------------

  private handleCommentResponse(res: any): void {
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

  private extractDataResponse(res: any): CommentEntity | null {
    if (
      (res.statusCode === StatusCode.SUCCESS ||
        res.statusCode === StatusCode.CREATED) &&
      res.data
    ) {
      return res.data as CommentEntity;
    }
    return null;
  }

  private handleError(err: HttpErrorResponse) {
    this.toastHandlingService.errorGeneral();
    return throwError(() => err);
  }
}
