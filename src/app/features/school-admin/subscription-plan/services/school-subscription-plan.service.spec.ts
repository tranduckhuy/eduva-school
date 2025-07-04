import { TestBed } from '@angular/core/testing';

import { SchoolSubscriptionPlanService } from './school-subscription-plan.service';

describe('SchoolSubscriptionPlanService', () => {
  let service: SchoolSubscriptionPlanService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SchoolSubscriptionPlanService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
