import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InvalidPolygonError } from '../../../domain/errors/invalid-polygon.error';
import { GeometryEngine } from '../../../domain/ports/geometry-engine.port';

@Injectable()
export class PostgresGeometryEngine implements GeometryEngine {
  constructor(private readonly dataSource: DataSource) {}

  async assertValidPolygon(geojson: string): Promise<void> {
    let validity: Array<{ valid: boolean; reason: string }>;
    try {
      validity = await this.dataSource.query<
        Array<{ valid: boolean; reason: string }>
      >(
        `
        SELECT
          ST_IsValid(ST_SetSRID(ST_GeomFromGeoJSON($1), 4326)) AS valid,
          ST_IsValidReason(ST_SetSRID(ST_GeomFromGeoJSON($1), 4326)) AS reason
        `,
        [geojson],
      );
    } catch {
      throw new InvalidPolygonError('polygon is not a valid geometry');
    }

    if (!validity[0]?.valid) {
      throw new InvalidPolygonError(
        validity[0]?.reason ?? 'polygon is not a valid geometry',
      );
    }
  }
}
