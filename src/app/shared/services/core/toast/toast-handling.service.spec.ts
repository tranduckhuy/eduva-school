import { TestBed } from '@angular/core/testing';
import { ToastHandlingService } from './toast-handling.service';
import { MessageService } from 'primeng/api';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('ToastHandlingService', () => {
  let service: ToastHandlingService;
  const messageServiceMock = {
    add: vi.fn(),
    clear: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        ToastHandlingService,
        { provide: MessageService, useValue: messageServiceMock },
      ],
    });

    service = TestBed.inject(ToastHandlingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  const toastLevels = [
    { method: 'success', severity: 'success' },
    { method: 'info', severity: 'info' },
    { method: 'warn', severity: 'warn' },
    { method: 'error', severity: 'error' },
    { method: 'contrast', severity: 'contrast' },
    { method: 'secondary', severity: 'secondary' },
  ] as const;

  for (const { method, severity } of toastLevels) {
    it(`should call show with severity=${severity}`, () => {
      service[method]('Title', 'Detail', {
        life: 5000,
        sticky: true,
        key: 'abc',
        closable: false,
      });

      expect(messageServiceMock.add).toHaveBeenCalledWith({
        severity,
        summary: 'Title',
        detail: 'Detail',
        life: 5000,
        sticky: true,
        key: 'abc',
        closable: false,
      });
    });
  }

  it('should fallback to default toast options', () => {
    service.success('Fallback Title', 'Fallback Detail');

    expect(messageServiceMock.add).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Fallback Title',
      detail: 'Fallback Detail',
      life: 3000,
      sticky: false,
      key: undefined,
      closable: true,
    });
  });

  it('should show successGeneral toast', () => {
    service.successGeneral();

    expect(messageServiceMock.add).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Thành công',
      detail: 'Thao tác đã được thực hiện thành công.',
      life: 3000,
      sticky: false,
      key: undefined,
      closable: true,
    });
  });

  it('should show errorGeneral toast', () => {
    service.errorGeneral();

    expect(messageServiceMock.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Lỗi hệ thống',
      detail: 'Đã xảy ra lỗi trong quá trình xử lý. Vui lòng thử lại sau.',
      life: 3000,
      sticky: false,
      key: undefined,
      closable: true,
    });
  });

  it('should clear toast without key', () => {
    service.clear();
    expect(messageServiceMock.clear).toHaveBeenCalledWith(undefined);
  });

  it('should clear toast with key', () => {
    service.clear('toast-key');
    expect(messageServiceMock.clear).toHaveBeenCalledWith('toast-key');
  });
});
