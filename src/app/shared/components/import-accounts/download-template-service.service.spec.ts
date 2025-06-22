import { TestBed } from '@angular/core/testing';

import { DownloadTemplateServiceService } from './download-template-service.service';

describe('DownloadTemplateServiceService', () => {
  let service: DownloadTemplateServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DownloadTemplateServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
