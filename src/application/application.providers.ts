import { Provider } from '@nestjs/common';
import {
  AREA_REPOSITORY,
  ENTRY_LOG_QUERY,
  GEOFENCE_UNIT_OF_WORK,
  GEOMETRY_ENGINE,
  HEALTH_PROBE,
} from './tokens';
import { AreaRepository } from '../domain/ports/area-repository.port';
import { EntryLogQueryPort } from '../domain/ports/entry-log-query.port';
import { GeofenceUnitOfWork } from '../domain/ports/geofence-unit-of-work.port';
import { GeometryEngine } from '../domain/ports/geometry-engine.port';
import { HealthProbe } from '../domain/ports/health-probe.port';
import { CheckHealthUseCase } from './use-cases/check-health.use-case';
import { CreateAreaUseCase } from './use-cases/create-area.use-case';
import { IngestLocationUseCase } from './use-cases/ingest-location.use-case';
import { ListAreasUseCase } from './use-cases/list-areas.use-case';
import { ListLogsUseCase } from './use-cases/list-logs.use-case';

export const applicationProviders: Provider[] = [
  {
    provide: IngestLocationUseCase,
    useFactory: (geofence: GeofenceUnitOfWork) =>
      new IngestLocationUseCase(geofence),
    inject: [GEOFENCE_UNIT_OF_WORK],
  },
  {
    provide: CreateAreaUseCase,
    useFactory: (areas: AreaRepository, geometry: GeometryEngine) =>
      new CreateAreaUseCase(areas, geometry),
    inject: [AREA_REPOSITORY, GEOMETRY_ENGINE],
  },
  {
    provide: ListAreasUseCase,
    useFactory: (areas: AreaRepository) => new ListAreasUseCase(areas),
    inject: [AREA_REPOSITORY],
  },
  {
    provide: ListLogsUseCase,
    useFactory: (logs: EntryLogQueryPort) => new ListLogsUseCase(logs),
    inject: [ENTRY_LOG_QUERY],
  },
  {
    provide: CheckHealthUseCase,
    useFactory: (probe: HealthProbe) => new CheckHealthUseCase(probe),
    inject: [HEALTH_PROBE],
  },
];

export const applicationExports = [
  IngestLocationUseCase,
  CreateAreaUseCase,
  ListAreasUseCase,
  ListLogsUseCase,
  CheckHealthUseCase,
];
