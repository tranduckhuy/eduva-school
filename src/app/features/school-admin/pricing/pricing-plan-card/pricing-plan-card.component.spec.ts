import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PricingPlanCardComponent } from './pricing-plan-card.component';

describe('PricingPlanCardComponent', () => {
  let component: PricingPlanCardComponent;
  let fixture: ComponentFixture<PricingPlanCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PricingPlanCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PricingPlanCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
