import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  signal,
} from '@angular/core';

type Item = {
  label: string;
  link: string;
  active?: boolean;
};

@Component({
  selector: 'navbar-accordion-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './accordion-item.component.html',
  styleUrl: './accordion-item.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccordionItemComponent {
  // ? Input
  label = input.required<string>();
  icon = input.required<string>();
  isSidebarCollapsed = input.required();
  type = input.required<'accordion' | 'link'>();
  link = input<string>('#!');
  submenuItems = input<Item[]>([]);
  isActive = input<boolean>(false);

  // ? State Management
  isOpen = signal<boolean>(false);

  toggleAccordion() {
    this.isOpen.set(!this.isOpen());
  }
}
