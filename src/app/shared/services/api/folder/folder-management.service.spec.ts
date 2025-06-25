import { TestBed } from '@angular/core/testing';

import { FolderManagementService } from './folder-management.service';

describe('FolderManagementService', () => {
  let service: FolderManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FolderManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
