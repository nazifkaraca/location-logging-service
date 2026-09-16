import { ConfigService } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { loadAppConfig } from '../../config/env';
import { AreaOrmEntity } from './entities/area.orm-entity';
import { AreaEntryLogOrmEntity } from './entities/area-entry-log.orm-entity';
import { UserAreaPresenceOrmEntity } from './entities/user-area-presence.orm-entity';
import { InitPostgis1730000000000 } from './migrations/1730000000000-InitPostgis';

export function typeOrmOptions(
  config: ConfigService,
  overrides: Partial<DataSourceOptions> = {},
): DataSourceOptions {
  const app = loadAppConfig(config);
  return {
    type: 'postgres',
    host: app.database.host,
    port: app.database.port,
    username: app.database.user,
    password: app.database.password,
    database: app.database.name,
    entities: [AreaOrmEntity, UserAreaPresenceOrmEntity, AreaEntryLogOrmEntity],
    migrations: [InitPostgis1730000000000],
    migrationsRun: true,
    synchronize: false,
    logging: app.database.logging,
    extra: {
      max: app.database.poolMax,
    },
    ...overrides,
  } as DataSourceOptions;
}

const cliConfig = new ConfigService(process.env);

export default new DataSource(typeOrmOptions(cliConfig));
