import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiSecurity,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CreateAreaUseCase } from '../../application/use-cases/create-area.use-case';
import { ListAreasUseCase } from '../../application/use-cases/list-areas.use-case';
import { AreaResponseDto } from './dto/area-response.dto';
import { CreateAreaDto } from './dto/create-area.dto';
import { AdminApiKeyGuard } from './guards/admin-api-key.guard';

@ApiTags('areas')
@ApiSecurity('apiKey')
@ApiUnauthorizedResponse()
@UseGuards(AdminApiKeyGuard)
@Controller('areas')
export class AreasController {
  constructor(
    private readonly createArea: CreateAreaUseCase,
    private readonly listAreas: ListAreasUseCase,
  ) {}

  @Post()
  @ApiCreatedResponse({ type: AreaResponseDto })
  create(@Body() dto: CreateAreaDto): Promise<AreaResponseDto> {
    return this.createArea.execute(dto);
  }

  @Get()
  @ApiOkResponse({ type: [AreaResponseDto] })
  findAll(): Promise<AreaResponseDto[]> {
    return this.listAreas.execute();
  }
}
