import { TestBed } from '@angular/core/testing';

import { MediaFocusService } from './media-focus.service';

describe('MediaFocusService', () => {
  let service: MediaFocusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MediaFocusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
