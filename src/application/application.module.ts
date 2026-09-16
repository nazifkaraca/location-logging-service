import { Module } from '@nestjs/common';
import {
  applicationExports,
  applicationProviders,
} from '../application/application.providers';
import { PersistenceModule } from '../infrastructure/persistence/persistence.module';

@Module({
  imports: [PersistenceModule],
  providers: applicationProviders,
  exports: applicationExports,
})
export class ApplicationModule {}
