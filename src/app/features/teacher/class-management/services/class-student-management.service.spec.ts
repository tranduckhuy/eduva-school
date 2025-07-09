import { TestBed } from '@angular/core/testing';

import { ClassStudentManagementService } from './class-student-management.service';

describe('ClassStudentManagementService', () => {
  let service: ClassStudentManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClassStudentManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
