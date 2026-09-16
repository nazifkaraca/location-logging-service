import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { configureApp } from './interfaces/http/configure-app';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
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

  const port = Number(process.env.PORT ?? 43123);
  await app.listen(port, '0.0.0.0');
}

void bootstrap();
