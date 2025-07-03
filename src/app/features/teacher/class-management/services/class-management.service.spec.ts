import { TestBed } from '@angular/core/testing';

import { ClassManagementService } from './class-management.service';

describe('ClassManagementService', () => {
  let service: ClassManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClassManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
