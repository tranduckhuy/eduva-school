import { Injectable, isDevMode } from '@angular/core';

import { LogLevel } from '../../../models/enum/log-level.enum';

@Injectable({
  providedIn: 'root',
})
export class LoggingService {
  private readonly currentLevel: LogLevel = isDevMode()
    ? LogLevel.DEBUG
    : LogLevel.NONE;

  private shouldLog(level: LogLevel): boolean {
    return level >= this.currentLevel;
  }

  debug(context: string, data?: any): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(`[DEBUG] [${context}]`, data ?? '');
    }
  }

  info(context: string, data?: any): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(`[INFO] [${context}]`, data ?? '');
    }
  }

  warn(context: string, data?: any): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(`[WARN] [${context}]`, data ?? '');
    }
  }

  error(context: string, data?: any): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(`[ERROR] [${context}]`, data ?? '');
    }
  }

  fatal(context: string, data?: any): void {
    if (this.shouldLog(LogLevel.FATAL)) {
      console.error(`[FATAL] [${context}]`, data ?? '');
    }
  }
}
