import { Injectable } from '@nestjs/common';

export interface AppConfig {
  port: number;
  globalPrefix: string;
  environment: string;
  logLevel: string;
}

@Injectable()
export class AppConfigService {
  getConfig(): AppConfig {
    return {
      port: parseInt(process.env.API_PORT || '3000', 10),
      globalPrefix: process.env.API_GLOBAL_PREFIX || 'api/v1',
      environment: process.env.NODE_ENV || 'development',
      logLevel: process.env.LOG_LEVEL || 'debug',
    };
  }
}
