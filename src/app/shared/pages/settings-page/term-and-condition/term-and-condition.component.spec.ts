import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TermAndConditionComponent } from './term-and-condition.component';

describe('TermAndConditionComponent', () => {
  let component: TermAndConditionComponent;
  let fixture: ComponentFixture<TermAndConditionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TermAndConditionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TermAndConditionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
