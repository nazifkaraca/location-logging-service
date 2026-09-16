import { ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { LocationRateLimitGuard } from './location-rate-limit.guard';

function contextWithIp(ip: string): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ ip }),
    }),
  } as ExecutionContext;
}

describe('LocationRateLimitGuard', () => {
  it('allows up to 200 requests per IP per second then 429s', () => {
    const guard = new LocationRateLimitGuard();
    const ctx = contextWithIp('127.0.0.1');
    for (let i = 0; i < 200; i += 1) {
      expect(guard.canActivate(ctx)).toBe(true);
    }
    try {
      guard.canActivate(ctx);
      throw new Error('expected 429');
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect((error as HttpException).getStatus()).toBe(
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  });

  it('tracks IPs separately', () => {
    const guard = new LocationRateLimitGuard();
    const a = contextWithIp('10.0.0.1');
    const b = contextWithIp('10.0.0.2');
    for (let i = 0; i < 200; i += 1) {
      expect(guard.canActivate(a)).toBe(true);
    }
    expect(guard.canActivate(b)).toBe(true);
  });
});
