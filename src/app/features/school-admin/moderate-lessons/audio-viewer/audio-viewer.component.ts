// audio-viewer.component.ts
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
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
  @ViewChild('audioPlayer') audioPlayer!: ElementRef<HTMLAudioElement>;
  audio = input<string>(
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
  ); // Default or dynamic input
  player!: Plyr;

  audioSrc = computed(() => {
    return { src: this.audio(), type: 'audio/mp3' };
  });

  ngAfterViewInit() {
    this.player = new Plyr(this.audioPlayer.nativeElement, {
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
  }

  ngOnDestroy() {
    if (this.player) this.player.destroy();
  }
}
