import { HealthStatus } from '../../domain/models';
import { HealthProbe } from '../../domain/ports/health-probe.port';

export class CheckHealthUseCase {
  constructor(private readonly probe: HealthProbe) {}

  execute(): Promise<HealthStatus> {
    return this.probe.check();
  }
}
