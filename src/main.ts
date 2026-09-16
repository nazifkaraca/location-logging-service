import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { loadAppConfig } from './infrastructure/config/env';
import { configureApp } from './interfaces/http/configure-app';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();
  configureApp(app);

  const swagger = new DocumentBuilder()
    .setTitle('Martı Location Logging API')
    .setDescription(
      'Enter-only geofence logging. A ping is written to logs only when a user first enters a defined polygon. Subsequent pings while still inside are a no-op. Raw pings are not stored.',
    )
    .setVersion('1.0.0')
    .build();
  const document = SwaggerModule.createDocument(app, swagger);
  SwaggerModule.setup('docs', app, document);

  const { port } = loadAppConfig(app.get(ConfigService));
  await app.listen(port, '0.0.0.0');
}

void bootstrap();
