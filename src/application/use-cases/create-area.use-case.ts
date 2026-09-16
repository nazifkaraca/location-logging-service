import { InvalidPolygonError } from '../../domain/errors/invalid-polygon.error';
import { Area } from '../../domain/models';
import {
  toGeoJsonPolygon,
  validatePolygonCoordinates,
} from '../../domain/geo/polygon';
import { AreaRepository } from '../../domain/ports/area-repository.port';
import { GeometryEngine } from '../../domain/ports/geometry-engine.port';

export class CreateAreaUseCase {
  constructor(
    private readonly areas: AreaRepository,
    private readonly geometry: GeometryEngine,
  ) {}

  async execute(input: { name: string; polygon: unknown }): Promise<Area> {
    const parsed = validatePolygonCoordinates(input.polygon);
    if (!parsed.ok) {
      throw new InvalidPolygonError(parsed.message);
    }

    await this.geometry.assertValidPolygon(
      toGeoJsonPolygon(parsed.coordinates),
    );

    return this.areas.create({
      name: input.name.trim(),
      polygon: parsed.coordinates,
    });
  }
}
