import { inject, Injectable, signal } from '@angular/core';

import { catchError, EMPTY, map, Observable, finalize } from 'rxjs';

import { RequestService } from '../../../../shared/services/core/request/request.service';
import { ToastHandlingService } from '../../../../shared/services/core/toast/toast-handling.service';
import { LoadingService } from '../../../../shared/services/core/loading/loading.service';
import { environment } from '../../../../../environments/environment';
import { StatusCode } from '../../../../shared/constants/status-code.constant';
import { BaseResponse } from '../../../../shared/models/api/base-response.model';
import { DashboardSchoolAdminResponse } from '../../../models/api/response/query/dashboard-sa-response.model';
import { DashboardRequest } from '../../../models/api/request/command/dashboard-request.model';
import { DashboardTeacherResponse } from '../../../models/api/response/query/dashboard-teacher-response.model';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly requestService = inject(RequestService);
  private readonly toastService = inject(ToastHandlingService);
  private readonly loadingService = inject(LoadingService);

  // API URLs
  private readonly BASE_URL = `${environment.baseApiUrl}/dashboards`;
  private readonly DASHBOARD_SCHOOL_ADMIN_URL = `${this.BASE_URL}/school-admin`;
  private readonly DASHBOARD_TEACHER_URL = `${this.BASE_URL}/teacher`;

  // Signals
  private readonly dashboardSchoolAdminSignal =
    signal<DashboardSchoolAdminResponse | null>(null);
  private readonly dashboardTeacherSignal =
    signal<DashboardTeacherResponse | null>(null);

  // Readonly signals
  readonly dashboardSchoolAdminData =
    this.dashboardSchoolAdminSignal.asReadonly();
  readonly dashboardTeacherData = this.dashboardTeacherSignal.asReadonly();

  /**
   * Fetches dashboard school admin data
   * @returns Observable with DashboardResponse or null
   */
  getDashboardSchoolAdminData(
    req: DashboardRequest
  ): Observable<DashboardSchoolAdminResponse | null> {
    this.loadingService.start('dashboard');

    return this.handleRequest<DashboardSchoolAdminResponse>(
      this.requestService.get<DashboardSchoolAdminResponse>(
        this.DASHBOARD_SCHOOL_ADMIN_URL,
        { ...req, topTeachersLimit: 7, reviewLessonsLimit: 7 }
      ),
      {
        successHandler: data => this.dashboardSchoolAdminSignal.set(data),
      }
    ).pipe(finalize(() => this.loadingService.stop('dashboard')));
  }

  /**
   * Fetches dashboard teacher / content moderator data
   * @returns Observable with DashboardResponse or null
   */
  getTeacherDashboardData(
    req: DashboardRequest
  ): Observable<DashboardTeacherResponse | null> {
    this.loadingService.start('dashboard');

    return this.handleRequest<DashboardTeacherResponse>(
      this.requestService.get<DashboardTeacherResponse>(
        this.DASHBOARD_TEACHER_URL,
        req
      ),
      {
        successHandler: data => this.dashboardTeacherSignal.set(data),
      }
    ).pipe(finalize(() => this.loadingService.stop('dashboard')));
  }

  // private fn
  private handleRequest<T>(
    request$: Observable<BaseResponse<T>>,
    options: {
      successHandler?: (data: T) => void;
      errorHandler?: () => void;
    } = {}
  ): Observable<T | null> {
    return request$.pipe(
      map(res => {
        if (res.statusCode === StatusCode.SUCCESS && res.data !== undefined) {
          options.successHandler?.(res.data);
          return res.data;
        }
        options.errorHandler?.();
        this.toastService.errorGeneral();
        return null;
      }),
      catchError(() => {
        this.toastService.errorGeneral();
        return EMPTY;
      })
    );
  }
}
