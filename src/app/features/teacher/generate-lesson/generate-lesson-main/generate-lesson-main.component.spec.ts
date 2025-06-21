import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateLessonMainComponent } from './generate-lesson-main.component';

describe('GenerateLessonMainComponent', () => {
  let component: GenerateLessonMainComponent;
  let fixture: ComponentFixture<GenerateLessonMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenerateLessonMainComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenerateLessonMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
