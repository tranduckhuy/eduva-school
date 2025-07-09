import { describe, it, expect, vi } from 'vitest';
import { LogLevel } from '../../../models/enum/log-level.enum';

vi.doMock('@angular/core', async () => {
  const actual =
    await vi.importActual<typeof import('@angular/core')>('@angular/core');
  return {
    ...actual,
    isDevMode: () => false,
  };
});

describe('LoggingService (prod mode)', () => {
  it('should not log anything at all', async () => {
    const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { LoggingService } = await import('./logging.service');
    const service = new LoggingService();

    service.debug('ctx', 'debug');
    service.info('ctx', 'info');
    service.warn('ctx', 'warn');
    service.error('ctx', 'error');
    service.fatal('ctx', 'fatal');

    expect(debugSpy).not.toHaveBeenCalled();
    expect(infoSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('should still instantiate the service', async () => {
    const { LoggingService } = await import('./logging.service');
    const service = new LoggingService();
    expect(service).toBeTruthy();
    expect((service as any).currentLevel).toBe(LogLevel.NONE);
  });
});
