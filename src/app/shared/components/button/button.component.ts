import { CommonModule } from '@angular/common';
import {
  Component,
  forwardRef,
  HostBinding,
  ChangeDetectionStrategy,
  input,
  output,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

type ButtonTheme =
  | 'default'
  | 'primary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'light'
  | 'dark';

type ButtonSize = 'default' | 'xs' | 'lg' | 'xl';

type ButtonVariant =
  | 'default'
  | 'outline'
  | 'outline-danger'
  | 'rounded'
  | 'light'
  | 'light-danger'
  | 'light-rounded'
  | 'outline-rounded';

type ButtonWidth = 'default' | 'full' | 'xs' | 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ButtonComponent),
      multi: true,
    },
  ],
})
export class ButtonComponent {
  variant = input<ButtonVariant>('default');
  size = input<ButtonSize>('default');
  theme = input<ButtonTheme>('default');
  width = input<ButtonWidth>('default');
  type = input<'button' | 'submit' | 'reset'>('button');
  disabled = input<boolean>(false);
  asChild = input<boolean>(false);
  loading = input<boolean>(false);
  loadingPosition = input<'left' | 'right'>('left');

  clicked = output<Event>();

  get spinnerSizeClass() {
    switch (this.size()) {
      case 'xs':
        return 'spinner-xs';
      case 'lg':
        return 'spinner-lg';
      case 'xl':
        return 'spinner-xl';
      default:
        return 'spinner-default';
    }
  }

  get spinnerColorClass(): string {
    switch (this.theme()) {
      case 'primary':
        return 'spinner-primary';
      case 'success':
        return 'spinner-success';
      case 'danger':
        return 'spinner-danger';
      case 'warning':
        return 'spinner-warning';
      case 'info':
        return 'spinner-info';
      case 'light':
        return 'spinner-light';
      case 'dark':
        return 'spinner-dark';
      default:
        return 'spinner-primary';
    }
  }

  get spinnerClasses(): string {
    return `spinner ${this.spinnerSizeClass} ${this.spinnerColorClass}`;
  }

  get sizePaddingClass(): string {
    switch (this.size()) {
      case 'xs':
        return 'py-2 px-2';
      case 'lg':
        return 'px-4 py-3';
      case 'xl':
        return 'px-5 py-4';
      default:
        return 'px-3 py-2';
    }
  }

  @HostBinding('class') get classes() {
    const loadingClass = this.loading() ? 'loading-state' : '';
    return `${this.buttonVariants()} ${loadingClass}`;
  }

  buttonVariants() {
    const baseClasses =
      'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded text-[14px] font-medium transition duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0';

    const themeClasses: Record<ButtonTheme, string> = {
      default: 'bg-primary text-white shadow',
      primary: 'bg-primary text-white shadow',
      success: 'bg-success-600 text-white',
      danger: 'bg-danger-600 text-white',
      warning: 'bg-warning-600 text-black',
      info: 'bg-info-500 text-white',
      light: 'bg-gray-100',
      dark: 'bg-gray-900 text-white',
    };

    const sizeClasses: Record<ButtonSize, string> = {
      default: 'rounded text-[14px]',
      xs: 'rounded text-[12px]',
      lg: 'rounded text-base',
      xl: 'rounded text-lg',
    };

    const variantClasses: Record<ButtonVariant, string> = {
      default: 'rounded',
      outline:
        'border border-primary bg-white dark:bg-dark-200 !text-primary hover:!bg-primary hover:!text-white',
      'outline-danger':
        'border border-danger bg-white dark:bg-dark-200 !text-danger',
      rounded: 'rounded-full',
      light: 'bg-primary-500/20 !text-primary-500',
      'light-danger': '!bg-danger-500/20 !text-danger-500',
      'light-rounded': 'bg-gray-100 text-gray-900 rounded-full',
      'outline-rounded': 'border border-current bg-transparent rounded-full',
    };

    const widthClasses: Record<ButtonWidth, string> = {
      default: '',
      xs: 'min-w-[90px]',
      sm: 'min-w-[110px]',
      md: 'min-w-[130px]',
      lg: 'min-w-[150px]',
      full: 'w-full',
    };

    return `${baseClasses} ${this.disabled() && 'pointer-events-none opacity-70 '} ${themeClasses[this.theme()]} ${variantClasses[this.variant()]} ${sizeClasses[this.size()]} ${widthClasses[this.width()]}`;
  }

  onClick(event: Event) {
    if (!this.disabled() && !this.loading()) {
      this.clicked.emit(event);
    }
  }
}
