import { Module } from '@nestjs/common';
import { ApplicationModule } from '../../application/application.module';
import { AreasController } from './areas.controller';
import { HealthController } from './health.controller';
import { LocationsController } from './locations.controller';
import { LogsController } from './logs.controller';
import { RootController } from './root.controller';

@Module({
  imports: [ApplicationModule],
  controllers: [
    RootController,
    HealthController,
    AreasController,
    LocationsController,
    LogsController,
  ],
})
export class HttpModule {}
