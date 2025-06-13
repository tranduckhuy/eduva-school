import {
  ChangeDetectionStrategy,
  Component,
  Input,
  HostBinding,
} from '@angular/core';

type BadgeVariant =
  | 'default'
  | 'secondary'
  | 'destructive'
  | 'success'
  | 'outline';
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
      secondary: 'border-transparent bg-secondary text-secondary-foreground',
      destructive: 'border-transparent bg-danger-500/20 text-danger-500 shadow',
      outline: 'text-foreground',
    };

    return `${baseClasses} ${variantClasses[variant]}`;
  }
}
