import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ApplicationModule } from './application/application.module';
import { SeedService } from './infrastructure/seed/seed.service';
import { PersistenceModule } from './infrastructure/persistence/persistence.module';
import { HttpModule } from './interfaces/http/http.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PersistenceModule,
    ApplicationModule,
    HttpModule,
  ],
  providers: [SeedService],
})
export class AppModule {}
