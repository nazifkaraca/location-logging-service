import { ApiProperty } from '@nestjs/swagger';

export class AreaEntryLogDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  areaId: string;

  @ApiProperty()
  enteredAt: Date;
}

export class PaginatedLogsDto {
  @ApiProperty({ type: [AreaEntryLogDto] })
  items: AreaEntryLogDto[];

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  total: number;
}
