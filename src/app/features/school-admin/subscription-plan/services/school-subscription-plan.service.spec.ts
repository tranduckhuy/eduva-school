import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

import { SchoolSubscriptionPlanService } from './school-subscription-plan.service';
import { RequestService } from '../../../../shared/services/core/request/request.service';
import { ToastHandlingService } from '../../../../shared/services/core/toast/toast-handling.service';
import { StatusCode } from '../../../../shared/constants/status-code.constant';
import { type SchoolSubscriptionPlan } from '../../../../shared/models/entities/school-subscription-plan.model';
import { BillingCycle } from '../../../../shared/models/api/request/command/create-plan-payment-link-request.model';

// Mock environment
vi.mock('../../../../../environments/environment', () => ({
  environment: {
    baseApiUrl: 'http://localhost:3000/api',
  },
}));

describe('SchoolSubscriptionPlanService', () => {
  let service: SchoolSubscriptionPlanService;
  let requestService: RequestService;
  let toastHandlingService: ToastHandlingService;

  const mockPlan: SchoolSubscriptionPlan = {
    planName: 'Premium',
    description: 'Full access',
    startDate: '2024-01-01',
    endDate: '2025-01-01',
    subscriptionStatus: 0,
    billingCycle: BillingCycle.Monthly,
    priceMonthly: 100,
    pricePerYear: 1000,
    maxUsers: 100,
    storageLimitGB: 500,
    amountPaid: 1200,
  };

  beforeEach(() => {
    requestService = {
      get: vi.fn(),
    } as any;
    toastHandlingService = {
      errorGeneral: vi.fn(),
    } as any;
    TestBed.configureTestingModule({
      providers: [
        SchoolSubscriptionPlanService,
        { provide: RequestService, useValue: requestService },
        { provide: ToastHandlingService, useValue: toastHandlingService },
      ],
    });
    service = TestBed.inject(SchoolSubscriptionPlanService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call correct API URL', async () => {
    (requestService.get as any).mockReturnValue(
      of({ statusCode: StatusCode.SUCCESS, data: mockPlan })
    );
    await new Promise<void>(resolve => {
      service.getCurrentSchoolPlan().subscribe(() => {
        expect(requestService.get).toHaveBeenCalledWith(
          'http://localhost:3000/api/school-subscriptions/current'
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
      service.getCurrentSchoolPlan().subscribe(result => {
        expect(result).toEqual(mockPlan);
        resolve();
      });
    });
  });

  it('should return null if statusCode is not SUCCESS', async () => {
    (requestService.get as any).mockReturnValue(
      of({ statusCode: StatusCode.SYSTEM_ERROR, data: mockPlan })
    );
    await new Promise<void>(resolve => {
      service.getCurrentSchoolPlan().subscribe(result => {
        expect(result).toBeNull();
        resolve();
      });
    });
  });

  it('should return null if data is missing', async () => {
    (requestService.get as any).mockReturnValue(
      of({ statusCode: StatusCode.SUCCESS })
    );
    await new Promise<void>(resolve => {
      service.getCurrentSchoolPlan().subscribe(result => {
        expect(result).toBeNull();
        resolve();
      });
    });
  });

  it('should return null and not show toast if SCHOOL_NOT_FOUND', async () => {
    const error = new HttpErrorResponse({
      error: { statusCode: StatusCode.SCHOOL_NOT_FOUND },
      status: 404,
    });
    (requestService.get as any).mockReturnValue(throwError(() => error));
    await new Promise<void>(resolve => {
      service.getCurrentSchoolPlan().subscribe(result => {
        expect(result).toBeNull();
        expect(toastHandlingService.errorGeneral).not.toHaveBeenCalled();
        resolve();
      });
    });
  });

  it('should return null and show toast for other errors', async () => {
    const error = new HttpErrorResponse({
      error: { statusCode: StatusCode.SYSTEM_ERROR },
      status: 500,
    });
    (requestService.get as any).mockReturnValue(throwError(() => error));
    await new Promise<void>(resolve => {
      service.getCurrentSchoolPlan().subscribe(result => {
        expect(result).toBeNull();
        expect(toastHandlingService.errorGeneral).toHaveBeenCalled();
        resolve();
      });
    });
  });

  it('should handle edge case: plan with all fields at zero/empty', async () => {
    const emptyPlan: SchoolSubscriptionPlan = {
      planName: '',
      description: '',
      startDate: '',
      endDate: '',
      subscriptionStatus: 0,
      billingCycle: BillingCycle.Monthly,
      priceMonthly: 0,
      pricePerYear: 0,
      maxUsers: 0,
      storageLimitGB: 0,
      amountPaid: 0,
    };
    (requestService.get as any).mockReturnValue(
      of({ statusCode: StatusCode.SUCCESS, data: emptyPlan })
    );
    await new Promise<void>(resolve => {
      service.getCurrentSchoolPlan().subscribe(result => {
        expect(result).toEqual(emptyPlan);
        resolve();
      });
    });
  });
});
