import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { timingSafeEqual } from 'node:crypto';
import type { Request } from 'express';
import { loadAppConfig } from '../../../infrastructure/config/env';

@Injectable()
export class AdminApiKeyGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const expected = loadAppConfig(this.config).apiKey;

    const header = context
      .switchToHttp()
      .getRequest<Request>()
      .header('x-api-key');
    if (header === undefined || header.length === 0) {
      throw new UnauthorizedException('X-API-Key is required');
    }

    const provided = Buffer.from(header, 'utf8');
    const wanted = Buffer.from(expected, 'utf8');
    if (
      provided.length !== wanted.length ||
      !timingSafeEqual(provided, wanted)
    ) {
      throw new UnauthorizedException('invalid API key');
    }
    return true;
  }
}
