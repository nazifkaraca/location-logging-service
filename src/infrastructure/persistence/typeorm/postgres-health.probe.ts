import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { HealthStatus } from '../../../domain/models';
import { HealthProbe } from '../../../domain/ports/health-probe.port';

@Injectable()
export class PostgresHealthProbe implements HealthProbe {
  constructor(private readonly dataSource: DataSource) {}

  async check(): Promise<HealthStatus> {
    let database = false;
    let postgis = false;

    try {
      await this.dataSource.query('SELECT 1');
      database = true;
      const rows = await this.dataSource.query<Array<{ extname: string }>>(
        `SELECT extname FROM pg_extension WHERE extname = 'postgis'`,
      );
      postgis = rows.length > 0;
    } catch {
      database = false;
      postgis = false;
    }

    return {
      status: database && postgis ? 'ok' : 'degraded',
      database,
      postgis,
    };
  }
}
