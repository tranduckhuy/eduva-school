import {
  Directive,
  ElementRef,
  HostListener,
  inject,
  output,
} from '@angular/core';

@Directive({
  selector: '[clickOutsideSubmenu]',
  standalone: true,
})
export class SubmenuDirective {
  private readonly elRef = inject(ElementRef);

  clickOutside = output();

  @HostListener('document:click', ['$event.target'])
  onClick(target: HTMLElement) {
    if (!this.elRef.nativeElement.contains(target)) {
      this.clickOutside.emit();
    }
  }
}
