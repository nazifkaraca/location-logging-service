import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
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
  check(): Promise<HealthStatus> {
    return this.checkHealth.execute();
  }
}
