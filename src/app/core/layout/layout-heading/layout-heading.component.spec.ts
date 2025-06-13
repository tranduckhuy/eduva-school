import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutHeadingComponent } from './layout-heading.component';

describe('LayoutHeadingComponent', () => {
  let component: LayoutHeadingComponent;
  let fixture: ComponentFixture<LayoutHeadingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutHeadingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LayoutHeadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
