import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateLessonChatComponent } from './generate-lesson-chat.component';

describe('GenerateLessonChatComponent', () => {
  let component: GenerateLessonChatComponent;
  let fixture: ComponentFixture<GenerateLessonChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenerateLessonChatComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenerateLessonChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
