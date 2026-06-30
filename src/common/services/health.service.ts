import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  getHealth(): Record<string, string> {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
