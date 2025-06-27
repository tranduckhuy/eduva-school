import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LessonCreationComponent } from './lesson-creation.component';

describe('LessonCreationComponent', () => {
  let component: LessonCreationComponent;
  let fixture: ComponentFixture<LessonCreationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LessonCreationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LessonCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
