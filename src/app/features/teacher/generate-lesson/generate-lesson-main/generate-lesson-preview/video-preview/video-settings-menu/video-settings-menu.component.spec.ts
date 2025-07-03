import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoSettingsMenuComponent } from './video-settings-menu.component';

describe('VideoSettingsMenuComponent', () => {
  let component: VideoSettingsMenuComponent;
  let fixture: ComponentFixture<VideoSettingsMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideoSettingsMenuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VideoSettingsMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
