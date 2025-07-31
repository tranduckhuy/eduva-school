import { inject, Injectable, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { environment } from '../../../../../environments/environment';

import { catchError, map, Observable, tap, throwError } from 'rxjs';

import { RequestService } from '../../../../shared/services/core/request/request.service';
import { ToastHandlingService } from '../../../../shared/services/core/toast/toast-handling.service';

import { StatusCode } from '../../../../shared/constants/status-code.constant';

import { type GetClassLessonMaterialsRequest } from '../../../../shared/models/api/request/query/get-lesson-materials-request.model';
import { type GetClassLessonMaterialsResponse } from '../../../../shared/models/api/response/query/get-lesson-materials-response.model';

@Injectable({
  providedIn: 'root',
})
export class ClassMaterialsManagementService {
  private readonly requestService = inject(RequestService);
  private readonly toastHandlingService = inject(ToastHandlingService);

  private readonly BASE_API_URL = environment.baseApiUrl;

  private readonly folderWithMaterialsSignal = signal<
    GetClassLessonMaterialsResponse[]
  >([]);
  folderWithMaterials = this.folderWithMaterialsSignal.asReadonly();

  getClassLessonMaterials(
    classId: string,
    request: GetClassLessonMaterialsRequest
  ): Observable<GetClassLessonMaterialsResponse[] | null> {
    return this.requestService
      .get<GetClassLessonMaterialsResponse>(
        `${this.BASE_API_URL}/classes/${classId}/lesson-materials`,
        request
      )
      .pipe(
        tap(res => this.handleListResponse(res)),
        map(res => this.extractListResponse(res)),
        catchError((err: HttpErrorResponse) => this.handleError(err))
      );
  }

  // ---------------------------
  //  Private Helper Functions
  // ---------------------------

  private handleListResponse(res: any): void {
    if (res.statusCode === StatusCode.SUCCESS && res.data) {
      this.folderWithMaterialsSignal.set(res.data ?? []);
    } else {
      this.toastHandlingService.errorGeneral();
    }
  }

  private extractListResponse(
    res: any
  ): GetClassLessonMaterialsResponse[] | null {
    return res.statusCode === StatusCode.SUCCESS && res.data
      ? (res.data as GetClassLessonMaterialsResponse[])
      : null;
  }

  private handleError(err: HttpErrorResponse): Observable<null> {
    this.toastHandlingService.errorGeneral();
    return throwError(() => err);
  }
}
