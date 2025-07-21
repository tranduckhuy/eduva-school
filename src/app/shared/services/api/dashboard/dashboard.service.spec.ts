import { TestBed } from '@angular/core/testing';
import { DashboardService } from './dashboard.service';
import { RequestService } from '../../../../shared/services/core/request/request.service';
import { ToastHandlingService } from '../../../../shared/services/core/toast/toast-handling.service';
import { LoadingService } from '../../../../shared/services/core/loading/loading.service';
import { HttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { of, firstValueFrom } from 'rxjs';
import { DashboardSchoolAdminResponse } from '../../../models/api/response/query/dashboard-sa-response.model';
import { DashboardRequest } from '../../../models/api/request/command/dashboard-request.model';
import { BaseResponse } from '../../../../shared/models/api/base-response.model';
import { vi } from 'vitest';
import {
  LessonMaterialStatus,
  ContentType,
} from '../../../../shared/models/enum/lesson-material.enum';
import { BillingCycle } from '../../../models/api/request/command/create-plan-payment-link-request.model';
import { StatusCode } from '../../../../shared/constants/status-code.constant';

describe('DashboardService', () => {
  let service: DashboardService;
  let requestService: RequestService;

  beforeEach(() => {
    const httpClientMock = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    };
    const messageServiceMock = {
      add: vi.fn(),
      clear: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        DashboardService,
        RequestService,
        ToastHandlingService,
        LoadingService,
        { provide: HttpClient, useValue: httpClientMock },
        { provide: MessageService, useValue: messageServiceMock },
      ],
    });
    service = TestBed.inject(DashboardService);
    requestService = TestBed.inject(RequestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch dashboard school admin data', async () => {
    const mockDashboardData: DashboardSchoolAdminResponse = {
      systemOverview: {
        totalUsers: 100,
        schoolAdmin: 2,
        contentModerators: 3,
        teachers: 10,
        students: 85,
        classes: 5,
        totalLessons: 50,
        uploadedLessons: 30,
        aiGeneratedLessons: 20,
        usedStorageBytes: 1000000,
        usedStorageGB: 1,
        currentSubscription: {
          id: 'sub-1',
          name: 'Standard',
          price: 100,
          maxStorageBytes: 10000000,
          maxStorageGB: 10,
          billingCycle: BillingCycle.Monthly,
          startDate: '2023-01-01',
          endDate: '2023-12-31',
        },
      },
      lessonActivity: [
        {
          period: '2023-01',
          uploadedCount: 10,
          aiGeneratedCount: 5,
          totalCount: 15,
        },
      ],
      reviewLessons: [
        {
          id: 'lesson-1',
          title: 'Lesson 1',
          lessonStatus: LessonMaterialStatus.Pending,
          ownerName: 'Teacher A',
          createdAt: '2023-01-10',
          contentType: ContentType.PDF,
        },
      ],
      contentTypeStats: [
        {
          pdf: 10,
          doc: 5,
          video: 3,
          audio: 2,
          total: 20,
          pdfPercentage: 50,
          docPercentage: 25,
          videoPercentage: 15,
          audioPercentage: 10,
        },
      ],
      lessonStatusStats: [
        {
          period: '2023-01',
          total: 15,
          pending: 5,
          approved: 8,
          rejected: 2,
          pendingPercentage: 33.3,
          approvedPercentage: 53.3,
          rejectedPercentage: 13.4,
        },
      ],
      topTeachers: [
        {
          id: 'teacher-1',
          fullName: 'Teacher A',
          lessonCount: 10,
          classesCount: 2,
        },
      ],
    };
    const mockResponse: BaseResponse<DashboardSchoolAdminResponse> = {
      statusCode: StatusCode.SUCCESS,
      message: 'OK',
      data: mockDashboardData,
    };
    vi.spyOn(requestService, 'get').mockReturnValue(of(mockResponse));
    const req: DashboardRequest = {} as DashboardRequest;
    const data = await firstValueFrom(service.getDashboardSchoolAdminData(req));
    expect(data).toEqual(mockDashboardData);
  });
});
