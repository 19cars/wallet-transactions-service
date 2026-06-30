import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  private readonly logger = new Logger(CorrelationIdMiddleware.name);

  use(req: Request, res: Response, next: NextFunction): void {
    const correlationId = (req.headers['x-correlation-id'] as string) || uuidv4();

    req.headers['x-correlation-id'] = correlationId;
    res.setHeader('x-correlation-id', correlationId);

    this.logger.debug(`[${correlationId}] ${req.method} ${req.path}`);

    next();
  }
}
