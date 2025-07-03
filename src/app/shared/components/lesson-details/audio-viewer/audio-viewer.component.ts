// audio-viewer.component.ts
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  DestroyRef,
  viewChild,
  inject,
  input,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import Plyr from 'plyr';

@Component({
  selector: 'app-audio-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './audio-viewer.component.html',
  styleUrls: ['./audio-viewer.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AudioViewerComponent {
  audioPlayer = viewChild<ElementRef>('audioPlayer');

  private readonly destroyRef = inject(DestroyRef);

  materialSourceUrl = input.required<string>();

  player!: Plyr;

  audioSrc = computed(() => {
    return { src: this.materialSourceUrl(), type: 'audio/mp3' };
  });

  ngAfterViewInit() {
    this.player = new Plyr(this.audioPlayer()?.nativeElement, {
      controls: [
        'play',
        'progress',
        'current-time',
        'mute',
        'volume',
        'settings',
        'seek',
      ],
      i18n: {
        play: 'Phát',
        pause: 'Tạm dừng',
        mute: 'Tắt tiếng',
        unmute: 'Bật tiếng',
        volume: 'Âm lượng',
        currentTime: 'Thời gian hiện tại',
        speed: 'Tốc độ',
        normal: 'Bình thường',
      },
    });

    this.destroyRef.onDestroy(() => this.player.destroy());
  }
}
