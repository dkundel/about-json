declare module 'eazy-logger' {
  export type LoggingFunction = (msg: string, ...args: any[]) => void;
  export interface LoggerInstance {
    debug: LoggingFunction;
    info: LoggingFunction;
    warn: LoggingFunction;
    error: LoggingFunction;
    log: LoggingFunction;
    setOnce(key: string, value: any): LoggerInstance;
  }
  export function Logger(opts?: any): LoggerInstance;
}
