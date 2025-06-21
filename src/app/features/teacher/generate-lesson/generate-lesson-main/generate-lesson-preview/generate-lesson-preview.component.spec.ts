import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateLessonPreviewComponent } from './generate-lesson-preview.component';

describe('GenerateLessonPreviewComponent', () => {
  let component: GenerateLessonPreviewComponent;
  let fixture: ComponentFixture<GenerateLessonPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenerateLessonPreviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenerateLessonPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
