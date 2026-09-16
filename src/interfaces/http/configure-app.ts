import { INestApplication, ValidationPipe, ValidationPipeOptions } from '@nestjs/common';
import { DomainExceptionFilter } from './filters/domain-exception.filter';

export const validationPipeOptions: ValidationPipeOptions = {
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
};

export function configureApp(app: INestApplication): void {
  app.useGlobalPipes(new ValidationPipe(validationPipeOptions));
  app.useGlobalFilters(new DomainExceptionFilter());
}
