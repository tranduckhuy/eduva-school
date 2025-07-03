import { TestBed } from '@angular/core/testing';
import { CanMatchFn } from '@angular/router';

import { redirectAuthenticatedGuard } from './redirect-authenticated.guard';

describe('redirectAuthenticatedGuard', () => {
  const executeGuard: CanMatchFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => redirectAuthenticatedGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
