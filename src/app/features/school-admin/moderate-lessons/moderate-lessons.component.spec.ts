import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModerateLessonsComponent } from './moderate-lessons.component';

describe('ModerateLessonsComponent', () => {
  let component: ModerateLessonsComponent;
  let fixture: ComponentFixture<ModerateLessonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModerateLessonsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ModerateLessonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
