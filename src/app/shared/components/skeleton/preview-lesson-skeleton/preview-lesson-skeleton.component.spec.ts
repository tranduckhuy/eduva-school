import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewLessonSkeletonComponent } from './preview-lesson-skeleton.component';

describe('PreviewLessonSkeletonComponent', () => {
  let component: PreviewLessonSkeletonComponent;
  let fixture: ComponentFixture<PreviewLessonSkeletonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreviewLessonSkeletonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreviewLessonSkeletonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
