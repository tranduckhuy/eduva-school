import { TestBed } from '@angular/core/testing';

import { DownloadTemplateService } from './download-template.service';

describe('DownloadTemplateService', () => {
  let service: DownloadTemplateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DownloadTemplateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
