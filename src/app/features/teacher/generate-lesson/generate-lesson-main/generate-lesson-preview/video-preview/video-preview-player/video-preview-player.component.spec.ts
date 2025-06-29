import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoPreviewPlayerComponent } from './video-preview-player.component';

describe('VideoPreviewPlayerComponent', () => {
  let component: VideoPreviewPlayerComponent;
  let fixture: ComponentFixture<VideoPreviewPlayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideoPreviewPlayerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VideoPreviewPlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
