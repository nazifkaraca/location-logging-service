import { Area } from '../../domain/models';
import { AreaRepository } from '../../domain/ports/area-repository.port';

export class ListAreasUseCase {
  constructor(private readonly areas: AreaRepository) {}

  execute(): Promise<Area[]> {
    return this.areas.findAll();
  }
}
