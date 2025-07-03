import { TestBed } from '@angular/core/testing';

import { ReadonlyModeService } from './readonly-mode.service';

describe('ReadonlyModeService', () => {
  let service: ReadonlyModeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReadonlyModeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
