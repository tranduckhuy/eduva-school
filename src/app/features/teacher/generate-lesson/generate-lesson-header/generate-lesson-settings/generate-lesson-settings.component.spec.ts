import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateLessonSettingsComponent } from './generate-lesson-settings.component';

describe('GenerateLessonSettingsComponent', () => {
  let component: GenerateLessonSettingsComponent;
  let fixture: ComponentFixture<GenerateLessonSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenerateLessonSettingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenerateLessonSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
