import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModerateReasonModalComponent } from './moderate-reason-modal.component';

describe('ModerateReasonModalComponent', () => {
  let component: ModerateReasonModalComponent;
  let fixture: ComponentFixture<ModerateReasonModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModerateReasonModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModerateReasonModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
