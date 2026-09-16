import { HealthStatus } from '../models';

export interface HealthProbe {
  check(): Promise<HealthStatus>;
}
