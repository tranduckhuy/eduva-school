import { TestBed } from '@angular/core/testing';

import { DateDisplayService } from './date-display.service';

describe('DateDisplayService', () => {
  let service: DateDisplayService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DateDisplayService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
