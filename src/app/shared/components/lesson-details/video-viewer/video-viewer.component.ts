import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  computed,
  ElementRef,
  inject,
  signal,
  viewChild,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { VgApiService, VgCoreModule } from '@videogular/ngx-videogular/core';

import {
  FontAwesomeModule,
  FaIconLibrary,
} from '@fortawesome/angular-fontawesome';
import {
  faPlay,
  faPause,
  faRotateLeft,
  faRotateRight,
  faVolumeHigh,
  faVolumeLow,
  faVolumeXmark,
  faGear,
  faExpand,
  faClosedCaptioning,
} from '@fortawesome/free-solid-svg-icons';
import { SettingsMenuComponent } from './settings-menu/settings-menu.component';

type VideoQuality = '1440' | '1080' | '720' | '360' | 'auto';

@Component({
  selector: 'app-video-viewer',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    VgCoreModule,
    SettingsMenuComponent,
  ],
  templateUrl: './video-viewer.component.html',
  styleUrl: './video-viewer.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoViewerComponent {
  videoPlayerRef = viewChild<ElementRef>('videoPlayer');
  progressBarRef = viewChild<ElementRef>('progressBar');
  volumeBarRef = viewChild<ElementRef>('volumeBar');

  private vgApi = inject(VgApiService);
  private readonly iconLibrary = inject(FaIconLibrary);

  materialSourceUrl = input.required<string>();

  private hideControlsTimeout!: ReturnType<typeof setTimeout>;

  // ? State Video Management
  preload = signal<string>('metadata');
  currentTime = signal<number>(0);
  duration = signal<number>(0);
  isPaused = signal<boolean>(true);
  hasStarted = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  showMobileControls = signal<boolean>(true);

  // ? State Controls Bar Management
  playedProgress = signal<number>(0);
  bufferedProgress = signal<number>(0);
  volumeLevel = signal<number>(1);
  lastVolumeLevel = signal<number>(1);
  menuType = signal<'settings' | 'quality'>('settings');
  selectedQuality = signal<VideoQuality>('1080');
  isSettingsMenuOpen = signal(false);
  currentSettingsMenu = signal<'home' | 'subtitle' | 'speed'>('home');

  // ? Computed for state detect changes
  showUiControls = computed(() => this.hasStarted());
  showingUiClass = computed(() =>
    this.showMobileControls() ? 'opacity-100 visible' : 'opacity-0 invisible'
  );

  constructor() {
    this.iconLibrary.addIcons(
      faPlay,
      faPause,
      faRotateLeft,
      faRotateRight,
      faVolumeHigh,
      faVolumeLow,
      faVolumeXmark,
      faGear,
      faExpand,
      faClosedCaptioning
    );
  }

  onPlayerReady(api: VgApiService) {
    this.vgApi = api;
    const media = api.getDefaultMedia();

    media.subscriptions.loadedMetadata.subscribe(() => {
      this.duration.set(media.duration);
    });

    media.subscriptions.timeUpdate.subscribe(() => {
      const current = media.currentTime;
      const duration = media.duration;

      this.currentTime.set(current);
      this.playedProgress.set((current / duration) * 100);

      const buffer = (media as any).buffer as TimeRanges;
      if (buffer?.length) {
        const currentTime = media.currentTime;
        for (let i = 0; i < buffer.length; i++) {
          const start = buffer.start(i);
          const end = buffer.end(i);
          if (currentTime >= start && currentTime <= end) {
            const buffered = (end / media.duration) * 100;
            this.bufferedProgress.set(buffered);
            return;
          }
        }
        this.bufferedProgress.set((currentTime / media.duration) * 100);
      }
    });

    media.subscriptions.waiting.subscribe(() => {
      this.isLoading.set(true);
      this.showMobileControls.set(false);
    });
    media.subscriptions.playing.subscribe(() => {
      this.isLoading.set(false);
      this.hasStarted.set(true);
      this.isPaused.set(false);
      this.onMobileTap();
    });
    media.subscriptions.pause.subscribe(() => this.isPaused.set(true));
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (this.shouldIgnoreKeyboardEvent(event)) return;

    const actions: Record<string, () => void> = {
      Space: () => {
        event.preventDefault(); // tránh scroll khi nhấn space
        this.togglePlayPause();
      },
      ArrowRight: () => this.forward(10),
      ArrowLeft: () => this.rewind(10),
      KeyF: () => this.toggleFullscreen(),
      KeyM: () => this.toggleMute(),
    };

    const action = actions[event.code];
    if (action) action();
  }

  playVideo() {
    const video = this.getVideoElement();
    video.play();
    this.hasStarted.set(true);
  }

  pauseVideo() {
    this.getVideoElement().pause();
  }

  togglePlayPause() {
    const video = this.getVideoElement();
    video.paused ? video.play() : video.pause();
  }

  rewind(seconds = 10) {
    const media = this.vgApi.getDefaultMedia();
    media.currentTime = Math.max(0, media.currentTime - seconds);
    this.onMobileTap();
  }

  forward(seconds = 10) {
    const media = this.vgApi.getDefaultMedia();
    media.currentTime = Math.min(media.duration, media.currentTime + seconds);
    this.onMobileTap();
  }

  seekTo(event: MouseEvent) {
    const rect = this.progressBarRef()?.nativeElement.getBoundingClientRect();
    const ratio = (event.clientX - rect.left) / rect.width;
    const media = this.vgApi.getDefaultMedia();
    media.currentTime = ratio * media.duration;
    this.playedProgress.set(ratio * 100);
  }

  startSeekDrag(event: MouseEvent) {
    this.startDrag(event, this.progressBarRef()!, ratio => {
      const media = this.vgApi.getDefaultMedia();
      media.currentTime = ratio * media.duration;
      this.playedProgress.set(ratio * 100);
    });
  }

  updateVolume(level: number) {
    const video = this.getVideoElement();
    video.volume = level;
    this.volumeLevel.set(level);
  }

  toggleMute() {
    const current = this.volumeLevel();
    if (current > 0) {
      this.lastVolumeLevel.set(current);
      this.updateVolume(0);
    } else {
      this.updateVolume(this.lastVolumeLevel() ?? 1);
    }
  }

  startVolumeDrag(event: MouseEvent) {
    this.startDrag(event, this.volumeBarRef()!, ratio => {
      this.updateVolume(ratio);
    });
  }

  toggleFullscreen() {
    const videoEl = document.getElementById('video-wrapper');
    if (!document.fullscreenElement) {
      videoEl?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  openOrToggleMenu(type: 'settings' | 'quality') {
    const currentOpen = this.isSettingsMenuOpen();
    const currentType = this.menuType();
    const isSameMenu = currentType === type;

    if (currentOpen && isSameMenu) {
      this.isSettingsMenuOpen.set(false);
      return;
    }

    this.isSettingsMenuOpen.set(false);

    setTimeout(() => {
      this.menuType.set(type);
      this.isSettingsMenuOpen.set(true);

      if (type === 'settings') {
        this.currentSettingsMenu.set('home');
      }
    }, 180);
  }

  onSettingsBtnClick(event: Event) {
    event.stopPropagation();
    this.openOrToggleMenu('settings');
  }

  onQualityBtnClick(event: Event) {
    event.stopPropagation();
    this.openOrToggleMenu('quality');
  }

  onMenuClosed() {
    this.isSettingsMenuOpen.set(false);
  }

  onMenuChange(menu: 'home' | 'subtitle' | 'speed') {
    this.currentSettingsMenu.set(menu);
  }

  onQualityChange(q: string) {
    this.selectedQuality.set(q as VideoQuality);

    const videoEl = this.videoPlayerRef()!.nativeElement;
    const currentTime = videoEl.currentTime;
    const wasPaused = videoEl.paused;

    videoEl.load();

    videoEl.onloadedmetadata = () => {
      videoEl.currentTime = currentTime;
      if (!wasPaused) {
        videoEl.play();
      }
    };
  }

  onSubtitleChange(code: 'vi' | 'en') {
    const trackList = Array.from(this.getVideoElement().textTracks);
    for (const track of trackList) {
      track.mode = track.language === code ? 'showing' : 'disabled';
    }
  }

  onRateChange(rate: number) {
    this.getVideoElement().playbackRate = rate;
  }

  onMobileTap() {
    const video = this.getVideoElement();
    this.showMobileControls.set(true);

    clearTimeout(this.hideControlsTimeout);
    if (!video.paused) {
      this.hideControlsTimeout = setTimeout(() => {
        this.showMobileControls.set(false);
      }, 3000);
    }
  }

  formatTime(seconds: number): string {
    if (isNaN(seconds)) return '00:00';
    const min = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const sec = Math.floor(seconds % 60)
      .toString()
      .padStart(2, '0');
    return `${min}:${sec}`;
  }

  private getVideoElement(): HTMLVideoElement {
    return this.vgApi.getDefaultMedia().elem as HTMLVideoElement;
  }

  private startDrag(
    event: MouseEvent,
    targetRef: ElementRef<HTMLElement>,
    onRatioChange: (ratio: number) => void
  ) {
    const onMouseMove = (e: MouseEvent) => {
      const rect = targetRef.nativeElement.getBoundingClientRect();
      let ratio = (e.clientX - rect.left) / rect.width;
      ratio = Math.max(0, Math.min(1, ratio));
      onRatioChange(ratio);
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    onMouseMove(event);
  }

  private shouldIgnoreKeyboardEvent(event: KeyboardEvent): boolean {
    const target = event.target as HTMLElement;
    return (
      ['INPUT', 'TEXTAREA'].includes(target.tagName) || target.isContentEditable
    );
  }
}
