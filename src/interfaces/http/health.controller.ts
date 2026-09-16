import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ApiOkResponse, ApiServiceUnavailableResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { CheckHealthUseCase } from '../../application/use-cases/check-health.use-case';
import { HealthStatus } from '../../domain/models';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly checkHealth: CheckHealthUseCase) {}

  @Get()
  @ApiOkResponse({
    schema: {
      example: { status: 'ok', database: true, postgis: true },
    },
  })
  @ApiServiceUnavailableResponse({
    schema: {
      example: { status: 'degraded', database: false, postgis: false },
    },
  })
  async check(@Res({ passthrough: true }) res: Response): Promise<HealthStatus> {
    const status = await this.checkHealth.execute();
    if (status.status !== 'ok') {
      res.status(HttpStatus.SERVICE_UNAVAILABLE);
    }
    return status;
  }
}
