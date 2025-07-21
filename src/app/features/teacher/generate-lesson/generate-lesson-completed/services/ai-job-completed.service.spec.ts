import { TestBed } from '@angular/core/testing';

import { AiJobCompletedService } from './ai-job-completed.service';

describe('AiJobCompletedService', () => {
  let service: AiJobCompletedService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AiJobCompletedService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
