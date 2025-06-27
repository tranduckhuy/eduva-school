import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RevenueTrendComponent } from './revenue-trend.component';

describe('RevenueTrendComponent', () => {
  let component: RevenueTrendComponent;
  let fixture: ComponentFixture<RevenueTrendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RevenueTrendComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RevenueTrendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
