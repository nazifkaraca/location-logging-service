import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';

const WINDOW_MS = 1000;
const LIMIT = 200;

@Injectable()
export class LocationRateLimitGuard implements CanActivate {
  // ponytail: in-process per-IP counter. Not shared across replicas — use Redis when you run more than one API instance.
  private readonly hits = new Map<string, { count: number; resetAt: number }>();

  canActivate(context: ExecutionContext): boolean {
    const ip =
      context.switchToHttp().getRequest<Request>().ip ?? 'unknown';
    const now = Date.now();
    let bucket = this.hits.get(ip);
    if (bucket === undefined || now >= bucket.resetAt) {
      bucket = { count: 0, resetAt: now + WINDOW_MS };
      this.hits.set(ip, bucket);
    }
    bucket.count += 1;
    if (bucket.count > LIMIT) {
      throw new HttpException('Too Many Requests', HttpStatus.TOO_MANY_REQUESTS);
    }
    return true;
  }
}
