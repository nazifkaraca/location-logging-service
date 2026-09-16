import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiSecurity,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ListLogsUseCase } from '../../application/use-cases/list-logs.use-case';
import { ListLogsQueryDto } from './dto/list-logs-query.dto';
import { PaginatedLogsDto } from './dto/paginated-logs.dto';
import { AdminApiKeyGuard } from './guards/admin-api-key.guard';

@ApiTags('logs')
@ApiSecurity('apiKey')
@ApiUnauthorizedResponse()
@UseGuards(AdminApiKeyGuard)
@Controller('logs')
export class LogsController {
  constructor(private readonly listLogs: ListLogsUseCase) {}

  @Get()
  @ApiOkResponse({ type: PaginatedLogsDto })
  find(@Query() query: ListLogsQueryDto): Promise<PaginatedLogsDto> {
    return this.listLogs.execute({
      userId: query.userId,
      areaId: query.areaId,
      from: query.from,
      to: query.to,
      page: query.page ?? 1,
      limit: query.limit ?? 20,
    });
  }
}
