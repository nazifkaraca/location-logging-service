import {
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAreaDto {
  @ApiProperty({ example: 'Kadıköy' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description:
      'GeoJSON Polygon coordinates. Positions are [longitude, latitude]. The first ring is the exterior and must be closed.',
    example: [
      [
        [29.01, 40.975],
        [29.08, 40.975],
        [29.08, 41.02],
        [29.01, 41.02],
        [29.01, 40.975],
      ],
    ],
  })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  polygon: number[][][];
}
