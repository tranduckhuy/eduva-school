import { TestBed } from '@angular/core/testing';

import { GlobalModalService } from './global-modal.service';

describe('GlobalModalService', () => {
  let service: GlobalModalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GlobalModalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
