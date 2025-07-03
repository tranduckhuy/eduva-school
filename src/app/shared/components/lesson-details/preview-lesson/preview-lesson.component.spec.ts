import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewLessonComponent } from './preview-lesson.component';

describe('PreviewLessonComponent', () => {
  let component: PreviewLessonComponent;
  let fixture: ComponentFixture<PreviewLessonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreviewLessonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreviewLessonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
