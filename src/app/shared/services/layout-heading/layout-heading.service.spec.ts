import { TestBed } from '@angular/core/testing';

import { LayoutHeadingService } from './layout-heading.service';

describe('LayoutHeadingService', () => {
  let service: LayoutHeadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LayoutHeadingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
