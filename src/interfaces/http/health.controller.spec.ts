import { HttpStatus } from '@nestjs/common';
import { HealthController } from './health.controller';
import { CheckHealthUseCase } from '../../application/use-cases/check-health.use-case';
import { HealthProbe } from '../../domain/ports/health-probe.port';

function probe(ok: boolean): HealthProbe {
  return {
    check: async () =>
      ok
        ? { status: 'ok', database: true, postgis: true }
        : { status: 'degraded', database: false, postgis: false },
  };
}

describe('HealthController', () => {
  it('returns 200 when postgres and postgis are up', async () => {
    const controller = new HealthController(new CheckHealthUseCase(probe(true)));
    const res = { status: jest.fn() };
    const body = await controller.check(res as never);
    expect(body.status).toBe('ok');
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 503 when the probe is degraded', async () => {
    const controller = new HealthController(
      new CheckHealthUseCase(probe(false)),
    );
    const res = { status: jest.fn() };
    const body = await controller.check(res as never);
    expect(body.status).toBe('degraded');
    expect(res.status).toHaveBeenCalledWith(HttpStatus.SERVICE_UNAVAILABLE);
  });
});
