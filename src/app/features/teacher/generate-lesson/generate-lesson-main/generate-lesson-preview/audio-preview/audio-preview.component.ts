import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  viewChild,
  inject,
  signal,
  effect,
  computed,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { SliderModule } from 'primeng/slider';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { SubmenuDirective } from '../../../../../../shared/directives/submenu/submenu.directive';

import { MediaFocusService } from '../services/media-focus.service';
import { ResourcesStateService } from '../../services/resources-state.service';

@Component({
  selector: 'generated-audio-preview',
  standalone: true,
  imports: [
    FormsModule,
    SliderModule,
    ButtonModule,
    TooltipModule,
    ProgressSpinnerModule,
    SubmenuDirective,
  ],
  templateUrl: './audio-preview.component.html',
  styleUrl: './audio-preview.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AudioPreviewComponent {
  private readonly audio = viewChild<ElementRef<HTMLAudioElement>>('audio');

  private readonly mediaFocusService = inject(MediaFocusService);
  private readonly resourcesStateService = inject(ResourcesStateService);

  isActive = this.mediaFocusService.isActive('audio');
  totalResourcesChecked = this.resourcesStateService.checkedSources;

  isPlaying = signal(false);
  currentTime = signal(0);
  duration = signal(0);
  volume = signal(100);
  playbackRate = signal(1.0);
  audioName = signal('');
  audioState = signal<'empty' | 'loading' | 'generated'>('empty');
  openedMenu = signal<boolean>(false);

  readonly disableGenerate = computed(() => {
    const uploading = this.resourcesStateService
      .sourceList()
      .some(x => x.isUploading);
    return (
      (this.resourcesStateService.totalSources() === 0 &&
        !this.resourcesStateService.hasInteracted()) ||
      this.resourcesStateService.isLoading() ||
      uploading
    );
  });

  private previousVolume = 100;
  readonly availableRates = [0.5, 0.8, 1.0, 1.2, 1.5, 2.0];

  constructor() {
    effect(() => {
      if (!this.isPlaying()) return;
      const interval = setInterval(() => {
        const audioEl = this.audio()?.nativeElement;
        if (audioEl) {
          this.currentTime.set(Math.floor(audioEl.currentTime));
        }
      }, 500);
      return () => clearInterval(interval);
    });

    effect(() => {
      const rate = this.playbackRate();
      const audioEl = this.audio()?.nativeElement;
      if (audioEl) {
        audioEl.playbackRate = rate;
      }
    });
  }

  get volumeIcon() {
    const v = this.volume();
    if (v === 0) return 'volume_off';
    if (v < 50) return 'volume_down';
    return 'volume_up';
  }

  togglePlayPause() {
    const audioEl = this.audio()?.nativeElement;
    if (!audioEl) return;

    if (this.isPlaying()) {
      audioEl.pause();
      this.isPlaying.set(false);
    } else {
      audioEl.play().then(() => this.isPlaying.set(true));
    }
  }

  toggleMute() {
    const audioEl = this.audio()?.nativeElement;
    if (!audioEl) return;

    const currentVolume = this.volume();

    if (currentVolume === 0) {
      audioEl.volume = this.previousVolume / 100;
      this.volume.set(this.previousVolume);
    } else {
      this.previousVolume = currentVolume;
      audioEl.volume = 0;
      this.volume.set(0);
    }
  }

  rewind(seconds = 10) {
    const audioEl = this.audio()?.nativeElement;
    if (!audioEl) return;

    const newTime = Math.max(0, audioEl.currentTime - seconds);
    audioEl.currentTime = newTime;
    this.currentTime.set(Math.floor(newTime));
  }

  forward(seconds = 10) {
    const audioEl = this.audio()?.nativeElement;
    if (!audioEl) return;

    const newTime = Math.min(audioEl.duration, audioEl.currentTime + seconds);
    audioEl.currentTime = newTime;
    this.currentTime.set(Math.floor(newTime));
  }

  onMetadataLoaded() {
    const audioEl = this.audio()?.nativeElement;
    if (audioEl) {
      this.duration.set(Math.floor(audioEl.duration));

      const src = audioEl.currentSrc || audioEl.src;
      const fileName = src.split('/').pop() ?? '';
      const nameWithoutExtension = fileName.replace(/\.[^/.]+$/, '');

      this.audioName.set(nameWithoutExtension);
    }
  }

  onTimeChange(value?: number) {
    if (value === undefined) return;
    const audioEl = this.audio()?.nativeElement;
    if (audioEl) {
      audioEl.currentTime = value;
      this.currentTime.set(value);
    }
  }

  onVolumeChange(value?: number) {
    if (value === undefined) return;
    const audioEl = this.audio()?.nativeElement;
    if (audioEl) {
      audioEl.volume = value / 100;
      this.volume.set(value);
    }
  }

  onPlaybackRateChange(rate: number) {
    this.playbackRate.set(rate);
  }

  setAsActive() {
    this.mediaFocusService.setActive('audio');
  }

  formatTime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    const pad = (n: number) => n.toString().padStart(2, '0');

    if (h > 0) {
      return `${h}:${pad(m)}:${pad(s)}`;
    }
    return `${pad(m)}:${pad(s)}`;
  }

  // ? Simulation
  simulateAudioGeneration() {
    this.audioState.set('loading');

    const delay = 3000 + Math.floor(Math.random() * 2000); // 3-5s

    setTimeout(() => {
      this.audioState.set('generated');
    }, delay);
  }

  toggleMenu() {
    this.openedMenu.set(!this.openedMenu());
  }

  private shouldIgnoreKeyboardEvent(event: KeyboardEvent): boolean {
    const target = event.target as HTMLElement;
    return (
      ['INPUT', 'TEXTAREA'].includes(target.tagName) || target.isContentEditable
    );
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (!this.isActive()) return;

    if (this.shouldIgnoreKeyboardEvent(event)) return;

    const actions: Record<string, () => void> = {
      Space: () => {
        event.preventDefault();
        this.togglePlayPause();
      },
      ArrowRight: () => this.forward(10),
      ArrowLeft: () => this.rewind(10),
      KeyM: () => this.toggleMute(),
    };

    const action = actions[event.code];
    if (action) action();
  }
}
