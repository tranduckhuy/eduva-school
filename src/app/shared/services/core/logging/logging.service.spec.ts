import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LoggingService } from './logging.service';
import { LogLevel } from '../../../models/enum/log-level.enum';

describe('LoggingService (dev mode)', () => {
  let service: LoggingService;
  let debugSpy: ReturnType<typeof vi.spyOn>;
  let infoSpy: ReturnType<typeof vi.spyOn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.resetAllMocks();
    debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    TestBed.configureTestingModule({});
    service = TestBed.inject(LoggingService);
  });

  it('should log all levels', () => {
    service.debug('ctx', 'debug');
    service.info('ctx', 'info');
    service.warn('ctx', 'warn');
    service.error('ctx', 'error');
    service.fatal('ctx', 'fatal');

    expect(debugSpy).toHaveBeenCalledWith('[DEBUG] [ctx]', 'debug');
    expect(infoSpy).toHaveBeenCalledWith('[INFO] [ctx]', 'info');
    expect(warnSpy).toHaveBeenCalledWith('[WARN] [ctx]', 'warn');
    expect(errorSpy).toHaveBeenCalledWith('[ERROR] [ctx]', 'error');
    expect(errorSpy).toHaveBeenCalledWith('[FATAL] [ctx]', 'fatal');
  });

  it('should not log if level is below threshold', () => {
    (service as any).currentLevel = LogLevel.ERROR;
    service.debug('ctx', 'debug');
    service.info('ctx', 'info');
    service.warn('ctx', 'warn');

    expect(debugSpy).not.toHaveBeenCalled();
    expect(infoSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('should default undefined data to empty string', () => {
    service.debug('ctx');
    service.info('ctx');
    expect(debugSpy).toHaveBeenCalledWith('[DEBUG] [ctx]', '');
    expect(infoSpy).toHaveBeenCalledWith('[INFO] [ctx]', '');
  });
});
