import { TestBed } from '@angular/core/testing';

import { ToastHandlingService } from './toast-handling.service';

describe('ToastHandlingService', () => {
  let service: ToastHandlingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastHandlingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
