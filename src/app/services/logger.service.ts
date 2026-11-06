import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoggerService {
  info(event: string, details?: unknown): void {
    console.info(`[Angular] ${event}`, details ?? '');
  }

  error(event: string, error: unknown): void {
    console.error(`[Angular] ${event}`, error);
  }
}
