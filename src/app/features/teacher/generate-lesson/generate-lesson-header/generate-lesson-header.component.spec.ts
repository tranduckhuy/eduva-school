import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateLessonHeaderComponent } from './generate-lesson-header.component';

describe('GenerateLessonHeaderComponent', () => {
  let component: GenerateLessonHeaderComponent;
  let fixture: ComponentFixture<GenerateLessonHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenerateLessonHeaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenerateLessonHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
