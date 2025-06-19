import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportAccountModalsComponent } from './import-account-modals.component';

describe('ImportAccountModalsComponent', () => {
  let component: ImportAccountModalsComponent;
  let fixture: ComponentFixture<ImportAccountModalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImportAccountModalsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImportAccountModalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
