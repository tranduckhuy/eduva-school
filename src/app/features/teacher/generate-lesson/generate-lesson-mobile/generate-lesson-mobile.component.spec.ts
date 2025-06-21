import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateLessonMobileComponent } from './generate-lesson-mobile.component';

describe('GenerateLessonMobileComponent', () => {
  let component: GenerateLessonMobileComponent;
  let fixture: ComponentFixture<GenerateLessonMobileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenerateLessonMobileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenerateLessonMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
