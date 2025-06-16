import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LessonMaterialViewComponent } from './lesson-material-view.component';

describe('LessonMaterialViewComponent', () => {
  let component: LessonMaterialViewComponent;
  let fixture: ComponentFixture<LessonMaterialViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LessonMaterialViewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LessonMaterialViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
