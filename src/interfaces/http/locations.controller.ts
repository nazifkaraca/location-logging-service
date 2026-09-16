import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiSecurity,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { IngestLocationUseCase } from '../../application/use-cases/ingest-location.use-case';
import { CreateLocationDto } from './dto/create-location.dto';
import { LocationPingResponseDto } from './dto/location-ping-response.dto';
import { AdminApiKeyGuard } from './guards/admin-api-key.guard';
import { LocationRateLimitGuard } from './guards/location-rate-limit.guard';

@ApiTags('locations')
@ApiSecurity('apiKey')
@ApiUnauthorizedResponse()
@ApiTooManyRequestsResponse()
@UseGuards(LocationRateLimitGuard, AdminApiKeyGuard)
@Controller('locations')
export class LocationsController {
  constructor(private readonly ingestLocation: IngestLocationUseCase) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: LocationPingResponseDto })
  ingest(@Body() dto: CreateLocationDto): Promise<LocationPingResponseDto> {
    return this.ingestLocation.execute(dto);
  }
}
