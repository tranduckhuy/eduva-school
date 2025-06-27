import {
  Directive,
  ElementRef,
  HostListener,
  DestroyRef,
  inject,
  output,
  signal,
} from '@angular/core';

@Directive({
  selector: '[clickOutsideSubmenu]',
  standalone: true,
})
export class SubmenuDirective {
  private readonly elRef = inject(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  private readonly destroyed = signal(false);

  clickOutside = output();

  constructor() {
    this.destroyRef.onDestroy(() => this.destroyed.set(true));
  }

  @HostListener('document:click', ['$event.target'])
  onClick(target: HTMLElement) {
    setTimeout(() => {
      if (this.destroyed()) return;

      if (!this.elRef.nativeElement.contains(target)) {
        this.clickOutside.emit();
      }
    });
  }

  @HostListener('window:close-all-submenus')
  onCloseAllSubmenus() {
    this.clickOutside.emit();
  }
}
