import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { HttpErrorResponse } from '@angular/common/http';

import { SubscriptionPlanService } from './subscription-plan.service';
import { RequestService } from '../../../../shared/services/core/request/request.service';
import { ToastHandlingService } from '../../../../shared/services/core/toast/toast-handling.service';
import { StatusCode } from '../../../../shared/constants/status-code.constant';
import { type SubscriptionPlan } from '../../../../shared/models/entities/subscription-plan.model';
import { EntityStatus } from '../../../../shared/models/enum/entity-status.enum';
import { type GetSubscriptionPlanRequest } from '../models/request/get-subscription-plan-request.model';
import { type GetSubscriptionPlanResponse } from '../models/response/get-subscription-plan-response.model';

// Mock environment
vi.mock('../../../../../environments/environment', () => ({
  environment: {
    baseApiUrl: 'http://localhost:3000/api',
  },
}));

describe('SubscriptionPlanService', () => {
  let service: SubscriptionPlanService;
  let requestService: RequestService;
  let toastHandlingService: ToastHandlingService;

  const mockPlan: SubscriptionPlan = {
    id: 1,
    name: 'Standard',
    description: 'Standard plan',
    maxUsers: 50,
    storageLimitGB: 100,
    priceMonthly: 10,
    pricePerYear: 100,
    isRecommended: false,
    status: EntityStatus.Active,
  };

  const mockPlan2: SubscriptionPlan = {
    id: 2,
    name: 'Pro',
    description: 'Pro plan',
    maxUsers: 200,
    storageLimitGB: 500,
    priceMonthly: 30,
    pricePerYear: 300,
    isRecommended: true,
    status: EntityStatus.InActive,
  };

  const mockListResponse: GetSubscriptionPlanResponse = {
    pageIndex: 1,
    pageSize: 10,
    count: 2,
    data: [mockPlan, mockPlan2],
  };

  const mockRequest: GetSubscriptionPlanRequest = { activeOnly: true };

  beforeEach(() => {
    requestService = {
      get: vi.fn(),
    } as any;
    toastHandlingService = {
      errorGeneral: vi.fn(),
    } as any;
    TestBed.configureTestingModule({
      providers: [
        SubscriptionPlanService,
        { provide: RequestService, useValue: requestService },
        { provide: ToastHandlingService, useValue: toastHandlingService },
      ],
    });
    service = TestBed.inject(SubscriptionPlanService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllPlans', () => {
    it('should call correct API URL with params', async () => {
      (requestService.get as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS, data: mockListResponse })
      );
      await new Promise<void>(resolve => {
        service.getAllPlans(mockRequest).subscribe(() => {
          expect(requestService.get).toHaveBeenCalledWith(
            'http://localhost:3000/api/subscription-plans',
            mockRequest
          );
          resolve();
        });
      });
    });

    it('should return response data on success', async () => {
      (requestService.get as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS, data: mockListResponse })
      );
      await new Promise<void>(resolve => {
        service.getAllPlans(mockRequest).subscribe(result => {
          expect(result).toEqual(mockListResponse);
          resolve();
        });
      });
    });

    it('should update subscriptionPlans signal on success', async () => {
      (requestService.get as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS, data: mockListResponse })
      );
      await new Promise<void>(resolve => {
        service.getAllPlans(mockRequest).subscribe(() => {
          expect(service.subscriptionPlans()).toEqual([mockPlan, mockPlan2]);
          resolve();
        });
      });
    });

    it('should return null and show toast if statusCode is not SUCCESS', async () => {
      (requestService.get as any).mockReturnValue(
        of({ statusCode: StatusCode.SYSTEM_ERROR, data: mockListResponse })
      );
      await new Promise<void>(resolve => {
        service.getAllPlans(mockRequest).subscribe(result => {
          expect(result).toBeNull();
          expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
          resolve();
        });
      });
    });

    it('should return null and show toast if data is missing', async () => {
      (requestService.get as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS })
      );
      await new Promise<void>(resolve => {
        service.getAllPlans(mockRequest).subscribe(result => {
          expect(result).toBeNull();
          expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
          resolve();
        });
      });
    });

    it('should return data undefined and show toast if data.data is missing', async () => {
      (requestService.get as any).mockReturnValue(
        of({
          statusCode: StatusCode.SUCCESS,
          data: { ...mockListResponse, data: undefined },
        })
      );
      await new Promise<void>(resolve => {
        service.getAllPlans(mockRequest).subscribe(result => {
          expect(result?.data).toBeUndefined();
          expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
          resolve();
        });
      });
    });

    it('should handle error and show toast', async () => {
      (requestService.get as any).mockReturnValue(
        throwError(() => new Error('Network error'))
      );
      await new Promise<void>(resolve => {
        service.getAllPlans(mockRequest).subscribe({
          next: () => {},
          error: () => {},
          complete: () => {
            expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
            resolve();
          },
        });
      });
    });
  });

  describe('getPlanById', () => {
    it('should call correct API URL', async () => {
      (requestService.get as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS, data: mockPlan })
      );
      await new Promise<void>(resolve => {
        service.getPlanById(1).subscribe(() => {
          expect(requestService.get).toHaveBeenCalledWith(
            'http://localhost:3000/api/subscription-plans/1'
          );
          resolve();
        });
      });
    });

    it('should return plan data on success', async () => {
      (requestService.get as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS, data: mockPlan })
      );
      await new Promise<void>(resolve => {
        service.getPlanById(1).subscribe(result => {
          expect(result).toEqual(mockPlan);
          resolve();
        });
      });
    });

    it('should update subscriptionPlan signal on success', async () => {
      (requestService.get as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS, data: mockPlan })
      );
      await new Promise<void>(resolve => {
        service.getPlanById(1).subscribe(() => {
          expect(service.subscriptionPlan()).toEqual(mockPlan);
          resolve();
        });
      });
    });

    it('should return null and show toast if statusCode is not SUCCESS', async () => {
      (requestService.get as any).mockReturnValue(
        of({ statusCode: StatusCode.SYSTEM_ERROR, data: mockPlan })
      );
      await new Promise<void>(resolve => {
        service.getPlanById(1).subscribe(result => {
          expect(result).toBeNull();
          expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
          resolve();
        });
      });
    });

    it('should return null and show toast if data is missing', async () => {
      (requestService.get as any).mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS })
      );
      await new Promise<void>(resolve => {
        service.getPlanById(1).subscribe(result => {
          expect(result).toBeNull();
          expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
          resolve();
        });
      });
    });

    it('should handle error and show toast', async () => {
      (requestService.get as any).mockReturnValue(
        throwError(() => new Error('Network error'))
      );
      await new Promise<void>(resolve => {
        service.getPlanById(1).subscribe({
          next: () => {},
          error: () => {},
          complete: () => {
            expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
            resolve();
          },
        });
      });
    });
  });

  it('should handle edge case: plan with all fields at zero/empty', async () => {
    const emptyPlan: SubscriptionPlan = {
      id: 0,
      name: '',
      description: '',
      maxUsers: 0,
      storageLimitGB: 0,
      priceMonthly: 0,
      pricePerYear: 0,
      isRecommended: false,
      status: EntityStatus.Deleted,
    };
    (requestService.get as any).mockReturnValue(
      of({ statusCode: StatusCode.SUCCESS, data: emptyPlan })
    );
    await new Promise<void>(resolve => {
      service.getPlanById(0).subscribe(result => {
        expect(result).toEqual(emptyPlan);
        resolve();
      });
    });
  });
});
