import { ApiProperty } from '@nestjs/swagger';

export class AreaResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({
    description: 'GeoJSON Polygon coordinates, [longitude, latitude]',
  })
  polygon: number[][][];

  @ApiProperty()
  createdAt: Date;
}
