import { TestBed } from '@angular/core/testing';

import { ImportUserAccountsService } from './import-user-accounts.service';

describe('ImportUserAccountsService', () => {
  let service: ImportUserAccountsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImportUserAccountsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
