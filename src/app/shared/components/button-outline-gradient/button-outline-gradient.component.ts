import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  input,
  output,
} from '@angular/core';

import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-button-outline-gradient',
  standalone: true,
  imports: [TooltipModule, CommonModule],
  templateUrl: './button-outline-gradient.component.html',
  styleUrl: './button-outline-gradient.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonOutlineGradientComponent {
  variant = input.required<'outline' | 'text' | 'icon'>();
  text = input<string>('');
  imgSrc = input<string>('');
  tooltipText = input<string>('');
  isDisabled = input<boolean>(false);

  mouseClick = output<void>();

  get btnClass() {
    return {
      btn: true,
      'btn--icon': this.variant() === 'icon',
      'btn--outline': this.variant() === 'outline',
      'btn--text': this.variant() === 'text',
      'btn--disabled': this.isDisabled(),
    };
  }

  @HostListener('click', ['$event'])
  onHostClick(event: MouseEvent) {
    event.stopPropagation();
    this.mouseClick.emit();
  }
}
