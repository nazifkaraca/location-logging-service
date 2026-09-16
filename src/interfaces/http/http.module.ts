import { Module } from '@nestjs/common';
import { ApplicationModule } from '../../application/application.module';
import { AreasController } from './areas.controller';
import { AdminApiKeyGuard } from './guards/admin-api-key.guard';
import { LocationRateLimitGuard } from './guards/location-rate-limit.guard';
import { HealthController } from './health.controller';
import { LocationsController } from './locations.controller';
import { LogsController } from './logs.controller';
import { RootController } from './root.controller';

@Module({
  imports: [ApplicationModule],
  providers: [AdminApiKeyGuard, LocationRateLimitGuard],
  controllers: [
    RootController,
    HealthController,
    AreasController,
    LocationsController,
    LogsController,
  ],
})
export class HttpModule {}
