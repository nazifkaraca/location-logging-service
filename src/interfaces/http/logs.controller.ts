import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ListLogsUseCase } from '../../application/use-cases/list-logs.use-case';
import { ListLogsQueryDto } from './dto/list-logs-query.dto';
import { PaginatedLogsDto } from './dto/paginated-logs.dto';

@ApiTags('logs')
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
