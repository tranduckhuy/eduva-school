import { TestBed } from '@angular/core/testing';
import { CanMatchFn } from '@angular/router';

import { subscriptionActiveGuard } from './subscription-active.guard';

describe('subscriptionActiveGuard', () => {
  const executeGuard: CanMatchFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => subscriptionActiveGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
