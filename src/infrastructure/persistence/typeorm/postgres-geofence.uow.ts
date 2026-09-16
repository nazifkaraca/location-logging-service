import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import {
  GeofenceSession,
  GeofenceUnitOfWork,
} from '../../../domain/ports/geofence-unit-of-work.port';

class PostgresGeofenceSession implements GeofenceSession {
  constructor(private readonly manager: EntityManager) {}

  async findContainingAreaIds(
    longitude: number,
    latitude: number,
  ): Promise<string[]> {
    const rows = (await this.manager.query(
      `
      SELECT id
      FROM areas
      WHERE ST_Covers(
        polygon,
        ST_SetSRID(ST_MakePoint($1, $2), 4326)
      )
      `,
      [longitude, latitude],
    )) as Array<{ id: string }>;
    return rows.map((row) => row.id);
  }

  async listPresence(userId: string): Promise<string[]> {
    const rows = (await this.manager.query(
      `SELECT area_id FROM user_area_presence WHERE user_id = $1`,
      [userId],
    )) as Array<{ area_id: string }>;
    return rows.map((row) => row.area_id);
  }

  async recordEnter(userId: string, areaId: string): Promise<void> {
    await this.manager.query(
      `
      INSERT INTO area_entry_logs (user_id, area_id, entered_at)
      VALUES ($1, $2, now())
      `,
      [userId, areaId],
    );
    await this.manager.query(
      `
      INSERT INTO user_area_presence (user_id, area_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, area_id) DO NOTHING
      `,
      [userId, areaId],
    );
  }

  async clearPresence(userId: string, areaIds: string[]): Promise<void> {
    await this.manager.query(
      `
      DELETE FROM user_area_presence
      WHERE user_id = $1 AND area_id = ANY($2::uuid[])
      `,
      [userId, areaIds],
    );
  }
}

@Injectable()
export class PostgresGeofenceUnitOfWork implements GeofenceUnitOfWork {
  constructor(private readonly dataSource: DataSource) {}

  withUserLock<T>(
    userId: string,
    work: (session: GeofenceSession) => Promise<T>,
  ): Promise<T> {
    return this.dataSource.transaction(async (manager) => {
      await manager.query(
        `SELECT pg_advisory_xact_lock(hashtextextended($1, 0))`,
        [userId],
      );
      return work(new PostgresGeofenceSession(manager));
    });
  }
}
