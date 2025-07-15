import { TestBed } from '@angular/core/testing';

import { AiJobsService } from './ai-jobs.service';

describe('AiJobsService', () => {
  let service: AiJobsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AiJobsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
