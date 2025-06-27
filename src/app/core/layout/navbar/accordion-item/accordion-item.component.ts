import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../../auth/services/auth.service';

type Item = {
  label: string;
  link: string;
  active?: boolean;
};

@Component({
  selector: 'navbar-accordion-item',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './accordion-item.component.html',
  styleUrl: './accordion-item.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccordionItemComponent {
  private readonly authService = inject(AuthService);

  // ? Input
  label = input.required<string>();
  icon = input.required<string>();
  isSidebarCollapsed = input.required();
  type = input.required<'link' | 'accordion' | 'button'>();
  link = input<string>('#!');
  submenuItems = input<Item[]>([]);
  isActive = input<boolean>(false);

  // ? State Management
  isOpen = signal<boolean>(false);

  ngOnInit() {
    const savedState = localStorage.getItem(this.getStorageKey());
    this.isOpen.set(savedState === 'true');
  }

  toggleAccordion() {
    const next = !this.isOpen();
    this.isOpen.set(next);
    localStorage.setItem(this.getStorageKey(), String(next));
  }

  onClick() {
    if (this.label() === 'Đăng xuất') {
      this.authService.logout().subscribe();
    }
  }

  private getStorageKey(): string {
    return `accordion-open:${this.label()}`;
  }
}
