import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtpConfirmationComponent } from './otp-confirmation.component';

describe('OtpConfirmationComponent', () => {
  let component: OtpConfirmationComponent;
  let fixture: ComponentFixture<OtpConfirmationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OtpConfirmationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OtpConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
