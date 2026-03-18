/**
 * RUDRA.OX LOGGER UTILITY
 * Centralized logging system for the entire bot
 * Supports different log levels with color coding
 */

enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

class Logger {
  private isDevelopment = process.env.NODE_ENV !== 'production';

  private formatMessage(level: LogLevel, message: string, args?: any[]): string {
    const timestamp = new Date().toISOString();
    let colorCode = colors.white;

    switch (level) {
      case LogLevel.DEBUG:
        colorCode = colors.cyan;
        break;
      case LogLevel.INFO:
        colorCode = colors.blue;
        break;
      case LogLevel.SUCCESS:
        colorCode = colors.green;
        break;
      case LogLevel.WARN:
        colorCode = colors.yellow;
        break;
      case LogLevel.ERROR:
        colorCode = colors.red;
        break;
    }

    const levelStr = `${colorCode}[${level}]${colors.reset}`;
    const timeStr = `${colors.dim}${timestamp}${colors.reset}`;
    const messageStr = `${message}`;

    let output = `${timeStr} ${levelStr} ${messageStr}`;

    if (args && args.length > 0) {
      output += '\n';
      args.forEach((arg) => {
        if (typeof arg === 'object') {
          // Handle Error objects specially
          if (arg instanceof Error) {
            output += `Error: ${arg.message}\n${arg.stack || ''}`;
          } else {
            output += JSON.stringify(arg, null, 2);
          }
        } else {
          output += String(arg);
        }
        output += '\n';
      });
    }

    return output;
  }

  debug(message: string, ...args: any[]): void {
    if (this.isDevelopment) {
      console.log(this.formatMessage(LogLevel.DEBUG, message, args));
    }
  }

  info(message: string, ...args: any[]): void {
    console.log(this.formatMessage(LogLevel.INFO, message, args));
  }

  success(message: string, ...args: any[]): void {
    console.log(this.formatMessage(LogLevel.SUCCESS, message, args));
  }

  warn(message: string, ...args: any[]): void {
    console.warn(this.formatMessage(LogLevel.WARN, message, args));
  }

  error(message: string, ...args: any[]): void {
    console.error(this.formatMessage(LogLevel.ERROR, message, args));
  }
}

const logger = new Logger();
export { logger, Logger };
