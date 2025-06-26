import { TestBed } from '@angular/core/testing';

import { SubscriptionPlansService } from './subscription-plans.service';

describe('SubscriptionPlansService', () => {
  let service: SubscriptionPlansService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SubscriptionPlansService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
