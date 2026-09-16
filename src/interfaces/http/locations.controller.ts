import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { IngestLocationUseCase } from '../../application/use-cases/ingest-location.use-case';
import { CreateLocationDto } from './dto/create-location.dto';
import { LocationPingResponseDto } from './dto/location-ping-response.dto';

@ApiTags('locations')
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
