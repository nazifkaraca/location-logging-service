import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AdminApiKeyGuard } from './admin-api-key.guard';

const required = {
  DATABASE_HOST: 'localhost',
  DATABASE_PORT: '5432',
  DATABASE_USER: 'marti',
  DATABASE_PASSWORD: 'secret',
  DATABASE_NAME: 'marti_location',
  API_KEY: 'correct',
};

function contextWithHeader(value: string | undefined): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        header: (name: string) =>
          name.toLowerCase() === 'x-api-key' ? value : undefined,
      }),
    }),
  } as ExecutionContext;
}

describe('AdminApiKeyGuard', () => {
  it('rejects a missing or wrong key', () => {
    const guard = new AdminApiKeyGuard(new ConfigService(required));
    expect(() => guard.canActivate(contextWithHeader(undefined))).toThrow(
      UnauthorizedException,
    );
    expect(() => guard.canActivate(contextWithHeader('wrong'))).toThrow(
      UnauthorizedException,
    );
  });

  it('accepts the matching header', () => {
    const guard = new AdminApiKeyGuard(new ConfigService(required));
    expect(guard.canActivate(contextWithHeader('correct'))).toBe(true);
  });
});
