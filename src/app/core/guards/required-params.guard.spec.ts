import { TestBed } from '@angular/core/testing';
import { CanMatchFn } from '@angular/router';

import { requiredParamsGuard } from './required-params.guard';

describe('requiredParamsGuard', () => {
  const executeGuard: CanMatchFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => requiredParamsGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
