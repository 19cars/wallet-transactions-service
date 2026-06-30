import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers?.authorization as string | undefined;

    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization token');
    }

    const token = authorization.replace('Bearer ', '').trim();

    if (token !== 'mock-jwt-token') {
      throw new UnauthorizedException('Invalid token');
    }

    request.user = { username: 'senior.backend' };
    return true;
  }
}
