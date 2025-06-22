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
  templateUrl: './button.component.html',
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

  clicked = output<Event>();

  @HostBinding('class') get classes() {
    return this.buttonVariants();
  }

  buttonVariants() {
    const baseClasses =
      'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded text-[14px] font-medium transition duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0';

    const themeClasses: Record<ButtonTheme, string> = {
      default: 'bg-primary text-white shadow hover:opacity-90',
      primary: 'bg-primary text-white shadow hover:opacity-90',
      success: 'bg-success-600 text-white hover:opacity-90',
      danger: 'bg-danger-600 text-white hover:opacity-90',
      warning: 'bg-warning-600 text-black hover:opacity-90',
      info: 'bg-info-500 text-white hover:opacity-90',
      light: 'bg-gray-100 hover:bg-gray-200',
      dark: 'bg-gray-900 text-white hover:opacity-90',
    };

    const sizeClasses: Record<ButtonSize, string> = {
      default: 'rounded px-3 py-2 text-[14px]',
      xs: 'rounded py-2 px-2 text-[12px]',
      lg: 'rounded px-4 py-3 text-base',
      xl: 'rounded px-5 py-4 text-lg',
    };

    const variantClasses: Record<ButtonVariant, string> = {
      default: 'rounded',
      outline:
        'border border-primary bg-white dark:bg-dark-200 !text-primary hover:!bg-primary hover:!text-white',
      'outline-danger':
        'border border-danger bg-white dark:bg-dark-200 !text-danger hover:!bg-danger hover:!text-white',
      rounded: 'rounded-full',
      light:
        'bg-primary-500/20 hover:!text-gray-50 !text-primary-500 hover:bg-primary-500',
      'light-danger':
        '!bg-danger-500/20 hover:!text-gray-50 !text-danger-500 hover:!bg-danger-500',
      'light-rounded': 'bg-gray-100 text-gray-900 rounded-full',
      'outline-rounded':
        'border border-current bg-transparent rounded-full hover:bg-current hover:text-white',
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
    if (!this.disabled()) {
      this.clicked.emit(event);
    }
  }
}
