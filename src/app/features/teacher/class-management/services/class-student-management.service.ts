import { inject, Injectable } from '@angular/core';

import { environment } from '../../../../../environments/environment';

import { RequestService } from '../../../../shared/services/core/request/request.service';
import { ToastHandlingService } from '../../../../shared/services/core/toast/toast-handling.service';
import { catchError, map, Observable, tap, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { StatusCode } from '../../../../shared/constants/status-code.constant';

@Injectable({
  providedIn: 'root',
})
export class ClassStudentManagementService {
  private readonly requestService = inject(RequestService);
  private readonly toastHandlingService = inject(ToastHandlingService);

  private readonly BASE_API_URL = environment.baseApiUrl;
  private readonly BASE_CLASS_API_URL = `${this.BASE_API_URL}/classes`;

  removeStudentFromClass(
    classId: string,
    request?: string[]
  ): Observable<void> {
    return this.requestService
      .deleteWithBody(`${this.BASE_CLASS_API_URL}/${classId}/students`, request)
      .pipe(
        tap(res => this.handleRemoveResponse(res)),
        map(() => void 0),
        catchError((err: HttpErrorResponse) => this.handleError(err))
      );
  }

  // ---------------------------
  //  Private Helper Functions
  // ---------------------------

  private handleRemoveResponse(res: any): void {
    if (res.statusCode === StatusCode.SUCCESS) {
      this.toastHandlingService.successGeneral();
    } else {
      this.toastHandlingService.errorGeneral();
    }
  }

  private handleError(err: HttpErrorResponse): Observable<void> {
    this.toastHandlingService.errorGeneral();
    return throwError(() => err);
  }
}
