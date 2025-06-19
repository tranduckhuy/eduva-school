import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportAccountsComponent } from './import-accounts.component';

describe('ImportAccountsComponent', () => {
  let component: ImportAccountsComponent;
  let fixture: ComponentFixture<ImportAccountsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImportAccountsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImportAccountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
