import { Area } from '../models';
import { PolygonCoordinates } from '../geo/polygon';

export interface AreaRepository {
  create(input: { name: string; polygon: PolygonCoordinates }): Promise<Area>;
  findAll(): Promise<Area[]>;
}
