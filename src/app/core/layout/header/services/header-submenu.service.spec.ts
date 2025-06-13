import { TestBed } from '@angular/core/testing';

import { HeaderSubmenuService } from './header-submenu.service';

describe('SubmenuService', () => {
  let service: HeaderSubmenuService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HeaderSubmenuService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
