import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Area } from '../../../domain/models';
import {
  PolygonCoordinates,
  toGeoJsonPolygon,
} from '../../../domain/geo/polygon';
import { AreaRepository } from '../../../domain/ports/area-repository.port';

type AreaRow = {
  id: string;
  name: string;
  polygon: { type: string; coordinates: number[][][] } | string;
  created_at: Date;
};

@Injectable()
export class PostgresAreaRepository implements AreaRepository {
  constructor(private readonly dataSource: DataSource) {}

  async create(input: {
    name: string;
    polygon: PolygonCoordinates;
  }): Promise<Area> {
    const rows = await this.dataSource.query<AreaRow[]>(
      `
      INSERT INTO areas (name, polygon)
      VALUES ($1, ST_SetSRID(ST_GeomFromGeoJSON($2), 4326))
      RETURNING id, name, created_at, ST_AsGeoJSON(polygon)::json AS polygon
      `,
      [input.name, toGeoJsonPolygon(input.polygon)],
    );
    return this.toArea(rows[0]);
  }

  async findAll(): Promise<Area[]> {
    const rows = await this.dataSource.query<AreaRow[]>(
      `
      SELECT id, name, created_at, ST_AsGeoJSON(polygon)::json AS polygon
      FROM areas
      ORDER BY created_at DESC
      `,
    );
    return rows.map((row) => this.toArea(row));
  }

  private toArea(row: AreaRow): Area {
    const polygon =
      typeof row.polygon === 'string'
        ? (JSON.parse(row.polygon) as { coordinates: number[][][] }).coordinates
        : row.polygon.coordinates;
    return {
      id: row.id,
      name: row.name,
      polygon,
      createdAt: row.created_at,
    };
  }
}
