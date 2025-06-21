import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  effect,
} from '@angular/core';
import { NgComponentOutlet, CommonModule } from '@angular/common';

import { GlobalModalService } from '../../services/layout/global-modal/global-modal.service';

@Component({
  selector: 'app-global-modal-host',
  standalone: true,
  imports: [CommonModule, NgComponentOutlet],
  templateUrl: './global-modal-host.component.html',
  styleUrl: './global-modal-host.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GlobalModalHostComponent {
  private readonly modalService = inject(GlobalModalService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    effect(() => {
      document.body.classList.toggle('overflow-hidden', this.isOpen);
    });

    this.destroyRef.onDestroy(() => {
      document.body.classList.remove('overflow-hidden');
    });
  }

  get isOpen() {
    return this.modalService.isOpen();
  }

  get component() {
    return this.modalService.component();
  }

  get injector() {
    return this.modalService.injector;
  }

  get data() {
    return this.modalService.data();
  }

  get modalClass() {
    return this.modalService.modalClass();
  }

  close() {
    this.modalService.close();
  }
}
