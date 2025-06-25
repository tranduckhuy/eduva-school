import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LessonTableComponent } from './lesson-table.component';

describe('LessonTableComponent', () => {
  let component: LessonTableComponent;
  let fixture: ComponentFixture<LessonTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LessonTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LessonTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
