import { TestBed } from '@angular/core/testing';

import { CreateSchoolService } from './create-school.service';

describe('CreateSchoolService', () => {
  let service: CreateSchoolService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CreateSchoolService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
