import {
  ChangeDetectionStrategy,
  Component,
  Input,
  HostBinding,
} from '@angular/core';

export type BadgeVariant =
  | 'default'
  | 'secondary'
  | 'destructive'
  | 'success'
  | 'outline'
  | 'info'
  | 'warning'
  | 'danger'
  | 'dark'
  | 'gray'
  | 'orange'
  | 'purple';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [],
  template: '<ng-content></ng-content>',
  styleUrl: './badge.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgeComponent {
  @Input() variant: BadgeVariant = 'default';

  @HostBinding('class')
  get hostClasses(): string {
    return this.getBadgeClasses(this.variant);
  }

  private getBadgeClasses(variant: BadgeVariant): string {
    const baseClasses =
      'inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';

    const variantClasses: Record<BadgeVariant, string> = {
      default: 'border-transparent bg-primary-200 text-primary shadow',
      success: 'border-transparent bg-success-500/20 text-success-500 shadow',
      secondary: 'border-transparent bg-secondary text-white shadow',
      destructive: 'border-transparent bg-danger-500/20 text-danger-500 shadow',
      outline: 'text-foreground',
      info: 'border-transparent bg-info-500/20 text-info-500 shadow',
      warning: 'border-transparent bg-warning-500/20 text-warning-600 shadow',
      danger: 'border-transparent bg-danger-500/20 text-danger-500 shadow',
      dark: 'border-transparent bg-dark-200 text-white shadow',
      gray: 'border-transparent bg-gray-200 text-gray-800 shadow',
      orange: 'border-transparent bg-orange-200 text-orange-600 shadow',
      purple: 'border-transparent bg-purple-200 text-purple-700 shadow',
    };

    return `${baseClasses} ${variantClasses[variant]}`;
  }
}
