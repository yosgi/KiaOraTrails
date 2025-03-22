/**
 * Logger utility for consistent application logging
 * 
 * Provides different log levels and structured output
 * Can be configured to filter logs by level based on environment
 */

import { APP_CONFIG } from './config';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

// Convert string log level from config to enum
function getConfiguredLogLevel(): LogLevel {
  const configLevel = APP_CONFIG.LOGGING.LEVEL.toLowerCase();
  switch (configLevel) {
    case 'debug': return LogLevel.DEBUG;
    case 'info': return LogLevel.INFO;
    case 'warn': return LogLevel.WARN;
    case 'error': return LogLevel.ERROR;
    default: return LogLevel.INFO;
  }
}

export class Logger {
  private static level: LogLevel = getConfiguredLogLevel();
  private static readonly PREFIX = 'LINZ-Map';

  /**
   * Set the minimum log level that will be output
   */
  static setLevel(level: LogLevel): void {
    Logger.level = level;
  }

  /**
   * Log debug information (verbose)
   * Only displayed in development environments
   */
  static debug(message: string, ...data: any[]): void {
    if (Logger.level <= LogLevel.DEBUG) {
      console.debug(`[${Logger.PREFIX}:DEBUG] ${message}`, ...data);
    }
  }

  /**
   * Log general information about application flow
   */
  static info(message: string, ...data: any[]): void {
    if (Logger.level <= LogLevel.INFO) {
      console.info(`[${Logger.PREFIX}:INFO] ${message}`, ...data);
    }
  }

  /**
   * Log warnings that don't prevent operation but might indicate problems
   */
  static warn(message: string, ...data: any[]): void {
    if (Logger.level <= LogLevel.WARN) {
      console.warn(`[${Logger.PREFIX}:WARN] ${message}`, ...data);
    }
  }

  /**
   * Log errors that affect functionality
   */
  static error(message: string, ...data: any[]): void {
    if (Logger.level <= LogLevel.ERROR) {
      console.error(`[${Logger.PREFIX}:ERROR] ${message}`, ...data);
    }
  }

  /**
   * Log the timing of an operation
   */
  static time(label: string): void {
    if (Logger.level <= LogLevel.DEBUG) {
      console.time(`[${Logger.PREFIX}:TIME] ${label}`);
    }
  }

  /**
   * End timing of an operation and log the result
   */
  static timeEnd(label: string): void {
    if (Logger.level <= LogLevel.DEBUG) {
      console.timeEnd(`[${Logger.PREFIX}:TIME] ${label}`);
    }
  }
}