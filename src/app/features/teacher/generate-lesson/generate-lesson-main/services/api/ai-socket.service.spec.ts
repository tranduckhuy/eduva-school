import { TestBed } from '@angular/core/testing';

import { AiSocketService } from './ai-socket.service';

describe('AiSocketService', () => {
  let service: AiSocketService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AiSocketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
