import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
} from '@angular/core';

import { injectNetwork } from 'ngxtension/inject-network';

import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-network-state',
  standalone: true,
  imports: [ToastModule],
  providers: [MessageService],
  template: `<p-toast key="bl" position="bottom-left" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NetworkStateComponent {
  private readonly network = injectNetwork();
  private readonly messageService = inject(MessageService);

  private lastOnline: boolean | null = null;

  constructor() {
    effect(() => {
      const isOnline = this.network.online();

      if (this.lastOnline === null) {
        this.lastOnline = isOnline;
        return;
      }

      if (isOnline !== this.lastOnline) {
        this.messageService.add({
          key: 'bl',
          severity: isOnline ? 'success' : 'secondary',
          summary: isOnline ? 'Đã kết nối lại' : 'Mất kết nối',
          detail: isOnline ? 'Đã khôi phục kết nối Internet' : 'Bạn đã offline',
          life: 3000,
        });

        this.lastOnline = isOnline;
      }
    });
  }
}
