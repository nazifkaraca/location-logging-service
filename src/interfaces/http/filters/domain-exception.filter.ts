import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { InvalidPolygonError } from '../../../domain/errors/invalid-polygon.error';

@Catch(InvalidPolygonError)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: InvalidPolygonError, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    response.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      message: exception.message,
      error: 'Bad Request',
    });
  }
}
