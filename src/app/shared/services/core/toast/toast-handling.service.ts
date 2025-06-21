import { Injectable, inject } from '@angular/core';

import { MessageService } from 'primeng/api';

export interface ToastExtraOptions {
  life?: number;
  sticky?: boolean;
  key?: string;
  closable?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ToastHandlingService {
  private readonly messageService = inject(MessageService);

  private show(
    severity: 'success' | 'info' | 'warn' | 'error' | 'contrast' | 'secondary',
    summary: string,
    detail: string,
    options?: ToastExtraOptions
  ) {
    this.messageService.add({
      severity,
      summary,
      detail,
      life: options?.life ?? 3000,
      sticky: options?.sticky ?? false,
      key: options?.key,
      closable: options?.closable ?? true,
    });
  }

  success(summary: string, detail: string, options?: ToastExtraOptions) {
    this.show('success', summary, detail, options);
  }

  info(summary: string, detail: string, options?: ToastExtraOptions) {
    this.show('info', summary, detail, options);
  }

  warn(summary: string, detail: string, options?: ToastExtraOptions) {
    this.show('warn', summary, detail, options);
  }

  error(summary: string, detail: string, options?: ToastExtraOptions) {
    this.show('error', summary, detail, options);
  }

  contrast(summary: string, detail: string, options?: ToastExtraOptions) {
    this.show('contrast', summary, detail, options);
  }

  secondary(summary: string, detail: string, options?: ToastExtraOptions) {
    this.show('secondary', summary, detail, options);
  }

  successGeneral(options?: ToastExtraOptions) {
    this.success(
      'Thành công',
      'Thao tác đã được thực hiện thành công.',
      options
    );
  }

  errorGeneral(options?: ToastExtraOptions) {
    this.error('Lỗi', 'Đã xảy ra lỗi. Vui lòng thử lại sau.', options);
  }

  clear(key?: string) {
    this.messageService.clear(key);
  }
}
