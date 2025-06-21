import { TestBed } from '@angular/core/testing';

import { ResourcesStateService } from './resources-state.service';

describe('ResourcesStateService', () => {
  let service: ResourcesStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ResourcesStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
