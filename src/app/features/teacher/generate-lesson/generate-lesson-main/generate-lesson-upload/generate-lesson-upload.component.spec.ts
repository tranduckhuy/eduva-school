import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateLessonUploadComponent } from './generate-lesson-upload.component';

describe('GenerateLessonUploadComponent', () => {
  let component: GenerateLessonUploadComponent;
  let fixture: ComponentFixture<GenerateLessonUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenerateLessonUploadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenerateLessonUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
