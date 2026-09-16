import { ConfigService } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { AreaOrmEntity } from './entities/area.orm-entity';
import { AreaEntryLogOrmEntity } from './entities/area-entry-log.orm-entity';
import { UserAreaPresenceOrmEntity } from './entities/user-area-presence.orm-entity';
import { InitPostgis1730000000000 } from './migrations/1730000000000-InitPostgis';

export function typeOrmOptions(
  config: ConfigService,
  overrides: Partial<DataSourceOptions> = {},
): DataSourceOptions {
  return {
    type: 'postgres',
    host: config.get<string>('DATABASE_HOST', 'localhost'),
    port: Number(config.get('DATABASE_PORT', 5432)),
    username: config.get<string>('DATABASE_USER', 'marti'),
    password: config.get<string>('DATABASE_PASSWORD', 'marti'),
    database: config.get<string>('DATABASE_NAME', 'marti_location'),
    entities: [AreaOrmEntity, UserAreaPresenceOrmEntity, AreaEntryLogOrmEntity],
    migrations: [InitPostgis1730000000000],
    migrationsRun: true,
    synchronize: false,
    logging: false,
    extra: {
      max: 30,
    },
    ...overrides,
  } as DataSourceOptions;
}

const cliConfig = new ConfigService(process.env);

export default new DataSource(typeOrmOptions(cliConfig));
