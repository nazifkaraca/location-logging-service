import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AREA_REPOSITORY,
  ENTRY_LOG_QUERY,
  GEOFENCE_UNIT_OF_WORK,
  GEOMETRY_ENGINE,
  HEALTH_PROBE,
} from '../../application/tokens';
import { PostgresAreaRepository } from './typeorm/postgres-area.repository';
import { PostgresEntryLogQuery } from './typeorm/postgres-entry-log.query';
import { PostgresGeofenceUnitOfWork } from './typeorm/postgres-geofence.uow';
import { PostgresGeometryEngine } from './typeorm/postgres-geometry.engine';
import { PostgresHealthProbe } from './typeorm/postgres-health.probe';
import { typeOrmOptions } from './typeorm/data-source';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => typeOrmOptions(config),
    }),
  ],
  providers: [
    { provide: GEOFENCE_UNIT_OF_WORK, useClass: PostgresGeofenceUnitOfWork },
    { provide: AREA_REPOSITORY, useClass: PostgresAreaRepository },
    { provide: GEOMETRY_ENGINE, useClass: PostgresGeometryEngine },
    { provide: ENTRY_LOG_QUERY, useClass: PostgresEntryLogQuery },
    { provide: HEALTH_PROBE, useClass: PostgresHealthProbe },
  ],
  exports: [
    TypeOrmModule,
    GEOFENCE_UNIT_OF_WORK,
    AREA_REPOSITORY,
    GEOMETRY_ENGINE,
    ENTRY_LOG_QUERY,
    HEALTH_PROBE,
  ],
})
export class PersistenceModule {}
