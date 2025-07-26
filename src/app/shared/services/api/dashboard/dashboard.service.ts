import { Injectable, inject, signal } from '@angular/core';

import { EMPTY, Observable, map, catchError } from 'rxjs';

import { environment } from '../../../../../environments/environment';

import { RequestService } from '../../../../shared/services/core/request/request.service';
import { ToastHandlingService } from '../../../../shared/services/core/toast/toast-handling.service';

import { StatusCode } from '../../../../shared/constants/status-code.constant';

import { type BaseResponse } from '../../../../shared/models/api/base-response.model';
import { type DashboardRequest } from '../../../models/api/request/command/dashboard-request.model';
import { type DashboardTeacherResponse } from '../../../models/api/response/query/dashboard-teacher-response.model';
import { type DashboardSchoolAdminResponse } from '../../../models/api/response/query/dashboard-sa-response.model';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly requestService = inject(RequestService);
  private readonly toastService = inject(ToastHandlingService);

  // API URLs
  private readonly BASE_URL = `${environment.baseApiUrl}/dashboards`;
  private readonly DASHBOARD_SCHOOL_ADMIN_API_URL = `${this.BASE_URL}/school-admin`;
  private readonly DASHBOARD_TEACHER_API_URL = `${this.BASE_URL}/teacher`;

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
    req?: DashboardRequest
  ): Observable<DashboardSchoolAdminResponse | null> {
    return this.handleRequest<DashboardSchoolAdminResponse>(
      this.requestService.get<DashboardSchoolAdminResponse>(
        this.DASHBOARD_SCHOOL_ADMIN_API_URL,
        { ...req, topTeachersLimit: 7, reviewLessonsLimit: 7 },
        { loadingKey: 'dashboard' }
      ),
      {
        successHandler: data => this.dashboardSchoolAdminSignal.set(data),
      }
    );
  }

  /**
   * Fetches dashboard teacher / content moderator data
   * @returns Observable with DashboardResponse or null
   */
  getTeacherDashboardData(
    req?: DashboardRequest
  ): Observable<DashboardTeacherResponse | null> {
    return this.handleRequest<DashboardTeacherResponse>(
      this.requestService.get<DashboardTeacherResponse>(
        this.DASHBOARD_TEACHER_API_URL,
        req,
        { loadingKey: 'dashboard' }
      ),
      {
        successHandler: data => this.dashboardTeacherSignal.set(data),
      }
    ).pipe();
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
