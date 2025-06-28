import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassOverviewComponent } from './class-overview.component';

describe('ClassOverviewComponent', () => {
  let component: ClassOverviewComponent;
  let fixture: ComponentFixture<ClassOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClassOverviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClassOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
