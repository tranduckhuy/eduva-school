import { inject, Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { catchError, map, Observable, tap, throwError } from 'rxjs';

import { environment } from '../../../../../environments/environment';

import { RequestService } from '../../../../shared/services/core/request/request.service';
import { ToastHandlingService } from '../../../../shared/services/core/toast/toast-handling.service';

import { StatusCode } from '../../../../shared/constants/status-code.constant';

@Injectable({
  providedIn: 'root',
})
export class ClassFolderManagementService {
  private readonly requestService = inject(RequestService);
  private readonly toastHandlingService = inject(ToastHandlingService);

  private readonly BASE_API_URL = environment.baseApiUrl;
  private readonly BASE_CLASS_API_URL = `${this.BASE_API_URL}/classes`;

  addMaterialsForClass(
    classId: string,
    folderId: string,
    request: string[]
  ): Observable<void> {
    return this.requestService
      .post(
        `${this.BASE_CLASS_API_URL}/${classId}/folders/${folderId}/lesson-materials`,
        request,
        {
          loadingKey: 'add-materials',
        }
      )
      .pipe(
        tap(res => this.handleResponse(res)),
        map(() => void 0),
        catchError((err: HttpErrorResponse) => this.handleError(err))
      );
  }

  removeMaterialsFromClass(
    classId: string,
    folderId: string,
    request?: string[]
  ): Observable<void> {
    return this.requestService
      .deleteWithBody(
        `${this.BASE_CLASS_API_URL}/${classId}/folders/${folderId}/lesson-materials`,
        request
      )
      .pipe(
        tap(res => this.handleResponse(res)),
        map(() => void 0),
        catchError((err: HttpErrorResponse) => this.handleError(err))
      );
  }

  // ---------------------------
  //  Private Helper Functions
  // ---------------------------

  private handleResponse(res: any): void {
    if (res.statusCode === StatusCode.SUCCESS) {
      this.toastHandlingService.successGeneral();
    } else {
      this.toastHandlingService.errorGeneral();
    }
  }

  private handleError(err: HttpErrorResponse): Observable<void> {
    if (
      err.error.statusCode ===
      StatusCode.LESSON_MATERIAL_ALREADY_EXISTS_IN_CLASS_FOLDER
    ) {
      this.toastHandlingService.warn(
        'Cảnh báo',
        'Tài liệu này đã tồn tại trong 1 thư mục của lớp này.'
      );
    } else {
      this.toastHandlingService.errorGeneral();
    }
    return throwError(() => err);
  }
}
