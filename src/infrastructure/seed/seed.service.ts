import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateAreaUseCase } from '../../application/use-cases/create-area.use-case';
import { ListAreasUseCase } from '../../application/use-cases/list-areas.use-case';
import {
  boundingBoxPolygon,
  type PolygonCoordinates,
} from '../../domain/geo/polygon';
import { loadAppConfig } from '../config/env';

export const ISTANBUL_SEED: ReadonlyArray<{
  name: string;
  polygon: PolygonCoordinates;
}> = [
  {
    name: 'Kadıköy',
    polygon: boundingBoxPolygon(29.01, 40.975, 29.08, 41.02),
  },
  {
    name: 'Moda Slow Zone',
    polygon: boundingBoxPolygon(29.022, 40.978, 29.04, 40.99),
  },
  {
    name: 'Beşiktaş',
    polygon: boundingBoxPolygon(29.0, 41.035, 29.04, 41.055),
  },
  {
    name: 'Beyoğlu',
    polygon: boundingBoxPolygon(28.97, 41.03, 29.0, 41.045),
  },
];

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly createArea: CreateAreaUseCase,
    private readonly listAreas: ListAreasUseCase,
  ) {}

  async onModuleInit(): Promise<void> {
    if (!loadAppConfig(this.config).seedOnBoot) {
      return;
    }
    await this.seedIfEmpty();
  }

  async seedIfEmpty(): Promise<void> {
    const existing = await this.listAreas.execute();
    if (existing.length > 0) {
      return;
    }
    for (const area of ISTANBUL_SEED) {
      await this.createArea.execute({
        name: area.name,
        polygon: area.polygon,
      });
    }
    this.logger.log(`Seeded ${ISTANBUL_SEED.length} Istanbul areas`);
  }
}
