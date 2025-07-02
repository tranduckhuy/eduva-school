import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubmenuDirective } from '../../../../../shared/directives/submenu/submenu.directive';

@Component({
  selector: 'video-settings-menu',
  standalone: true,
  imports: [CommonModule, SubmenuDirective],
  templateUrl: './settings-menu.component.html',
  styleUrl: './settings-menu.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsMenuComponent {
  type = input<'settings' | 'quality'>('settings');
  isSettingsMenuOpen = input<boolean>(false);
  currentSettingsMenu = input<'home' | 'subtitle' | 'speed'>('home');

  closed = output<void>();
  menuChange = output<'home' | 'subtitle' | 'speed'>();
  subtitleChange = output<'vi' | 'en'>();
  qualityChange = output<string>();
  playbackRateChange = output<number>();

  selectedQuality = signal<string>('auto');
  qualityOptions = signal<string[]>(['1440', '1080', '720', '360', 'Auto']);
  selectedSubtitle = signal<'vi' | 'en'>('vi');
  selectedRate = signal<number>(1);
  rates = signal<number[]>([0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]);

  navigate(menu: 'subtitle' | 'speed') {
    this.menuChange.emit(menu);
  }

  backToHome() {
    this.menuChange.emit('home');
  }

  selectQuality(q: string) {
    this.selectedQuality.set(q);
    this.qualityChange.emit(q);
  }

  selectSubtitle(sub: 'vi' | 'en') {
    this.selectedSubtitle.set(sub);
    this.backToHome();
    this.subtitleChange.emit(sub);
  }

  selectRate(rate: number) {
    this.selectedRate.set(rate);
    this.backToHome();
    this.playbackRateChange.emit(rate);
  }

  onClickOutside() {
    this.closed.emit();
  }
}
