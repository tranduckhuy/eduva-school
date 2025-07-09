import { TestBed } from '@angular/core/testing';

import { ClassFolderManagementService } from './class-folder-management.service';

describe('ClassFolderManagementService', () => {
  let service: ClassFolderManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClassFolderManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
