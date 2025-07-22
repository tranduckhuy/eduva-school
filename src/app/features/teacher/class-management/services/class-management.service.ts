import { Injectable, inject, signal } from '@angular/core';

import { Observable, catchError, map, of, tap } from 'rxjs';

import { environment } from '../../../../../environments/environment';

import { RequestService } from '../../../../shared/services/core/request/request.service';
import { ToastHandlingService } from '../../../../shared/services/core/toast/toast-handling.service';

import { StatusCode } from '../../../../shared/constants/status-code.constant';

import { type ClassModel } from '../../../../shared/models/entities/class.model';
import { type GetTeacherClassRequest } from '../models/request/query/get-teacher-class-request.model';
import { type GetTeacherClassResponse } from '../models/response/query/get-teacher-class-response.model';
import { type CreateClassRequest } from '../models/request/command/create-class-request.model';
import { HttpErrorResponse } from '@angular/common/http';
import { GetStudentsClassRequest } from '../models/request/query/get-students-class-request.model';
import {
  GetStudentsClassResponse,
  StudentClassResponse,
} from '../models/response/query/get-students-class-response.model';

@Injectable({
  providedIn: 'root',
})
export class ClassManagementService {
  private readonly requestService = inject(RequestService);
  private readonly toastHandlingService = inject(ToastHandlingService);

  private readonly BASE_API_URL = environment.baseApiUrl;
  private readonly BASE_CLASS_API_URL = `${this.BASE_API_URL}/classes`;
  private readonly GET_TEACHER_CLASS_API_URL = `${this.BASE_CLASS_API_URL}/teaching`;

  private readonly classesSignal = signal<ClassModel[]>([]);
  classes = this.classesSignal.asReadonly();

  private readonly classModelSignal = signal<ClassModel | null>(null);
  classModel = this.classModelSignal.asReadonly();

  private readonly totalClassSignal = signal<number>(0);
  totalClass = this.totalClassSignal.asReadonly();

  createClass(request: CreateClassRequest): Observable<ClassModel | null> {
    return this.requestService
      .post<ClassModel>(this.BASE_CLASS_API_URL, request)
      .pipe(
        tap(res => this.handleCreateTeacherClassResponse(res)),
        map(res => this.extractClassFromResponse(res)),
        catchError((err: HttpErrorResponse) =>
          this.handleCreateTeacherClassError(err)
        )
      );
  }

  getClasses(
    request: GetTeacherClassRequest
  ): Observable<GetTeacherClassResponse | null> {
    return this.requestService
      .get<GetTeacherClassResponse>(this.GET_TEACHER_CLASS_API_URL, request)
      .pipe(
        tap(res => this.handleGetTeacherClassesResponse(res)),
        map(res => this.extractTeacherClassesFromResponse(res)),
        catchError(() => {
          this.toastHandlingService.errorGeneral();
          return of(null);
        })
      );
  }

  getClassById(classId: string): Observable<ClassModel | null> {
    return this.requestService
      .get<ClassModel>(`${this.BASE_CLASS_API_URL}/${classId}`)
      .pipe(
        tap(res => this.handleGetClassResponse(res)),
        map(res => this.extractClassFromResponse(res)),
        catchError(() => {
          this.toastHandlingService.errorGeneral();
          return of(null);
        })
      );
  }

  refreshClassCode(classId: string): Observable<ClassModel | null> {
    return this.requestService
      .post<ClassModel>(`${this.BASE_CLASS_API_URL}/${classId}/reset-code`)
      .pipe(
        tap(res => this.handleRefreshCodeResponse(res)),
        map(res => this.extractClassFromResponse(res)),
        catchError(() => {
          this.toastHandlingService.errorGeneral();
          return of(null);
        })
      );
  }

  getStudentsClass(
    classId: string,
    request?: GetStudentsClassRequest
  ): Observable<StudentClassResponse[] | null> {
    return this.requestService
      .get<GetStudentsClassResponse>(
        `${this.BASE_CLASS_API_URL}/${classId}/students`,
        request
      )
      .pipe(
        map(res => this.extractStudentsFromResponse(res)),
        catchError(() => {
          this.toastHandlingService.errorGeneral();
          return of(null);
        })
      );
  }

  updateClassModelPartial(update: Partial<ClassModel>): void {
    const current = this.classModelSignal();
    if (!current) return;
    const merged = { ...current, ...update };
    this.classModelSignal.set(merged);
  }

  // ---------------------------
  //  Private Helper Functions
  // ---------------------------

  private handleCreateTeacherClassResponse(res: any) {
    if (res.statusCode === StatusCode.CREATED && res.data) {
      this.toastHandlingService.success(
        'Tạo lớp học thành công',
        'Lớp học của bạn đã được tạo thành công. Bạn có thể bắt đầu thêm học sinh hoặc tài liệu.'
      );

      const currentList = this.classesSignal();
      this.classesSignal.set([...currentList, res.data]);
    } else {
      this.toastHandlingService.errorGeneral();
    }
  }

  private extractClassFromResponse(res: any): ClassModel | null {
    if (
      (res.statusCode === StatusCode.CREATED && res.data) ||
      (res.statusCode === StatusCode.SUCCESS && res.data)
    ) {
      return res.data;
    }
    return null;
  }

  private handleCreateTeacherClassError(
    err: HttpErrorResponse
  ): Observable<null> {
    switch (err.error.statusCode) {
      case StatusCode.PROVIDED_INFORMATION_IS_INVALID:
        this.toastHandlingService.warn(
          'Tên lớp học không hợp lệ',
          'Tên lớp học đã tồn tại. Vui lòng chọn một tên khác và thử lại.'
        );
        break;
      case StatusCode.CLASS_CREATE_FAILED:
        this.toastHandlingService.error(
          'Không thể tạo lớp học',
          'Hệ thống gặp sự cố khi tạo lớp. Vui lòng thử lại sau.'
        );
        break;
      default:
        this.toastHandlingService.errorGeneral();
    }
    return of(null);
  }

  private handleGetTeacherClassesResponse(res: any): void {
    if (res.statusCode === StatusCode.SUCCESS && res.data) {
      const classes = res.data.data;
      this.classesSignal.set(classes);
      this.totalClassSignal.set(res.data.count);
    } else {
      this.toastHandlingService.errorGeneral();
    }
  }

  private extractTeacherClassesFromResponse(
    res: any
  ): GetTeacherClassResponse | null {
    if (res.statusCode === StatusCode.SUCCESS && res.data) {
      return res.data;
    }
    return null;
  }

  private handleRefreshCodeResponse(res: any): void {
    if (res.statusCode === StatusCode.SUCCESS && res.data) {
      this.toastHandlingService.success(
        'Mã lớp học đã được làm mới',
        'Bạn có thể chia sẻ mã mới này với học sinh.'
      );
      const classModel = res.data as ClassModel;
      this.updateClassModelPartial({ classCode: classModel.classCode });
    } else {
      this.toastHandlingService.error(
        'Không thể làm mới mã lớp',
        'Đã xảy ra lỗi trong quá trình cập nhật mã lớp học.'
      );
    }
  }

  private handleGetClassResponse(res: any): void {
    if (res.statusCode === StatusCode.SUCCESS && res.data) {
      this.classModelSignal.set(res.data);
    } else {
      this.toastHandlingService.errorGeneral();
    }
  }

  private extractStudentsFromResponse(res: any): StudentClassResponse[] | null {
    if (res.statusCode === StatusCode.SUCCESS && res.data) {
      const students = res.data.data as StudentClassResponse[];
      return students;
    }
    return null;
  }
}
