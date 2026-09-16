import { ApiProperty } from '@nestjs/swagger';

export class LocationPingResponseDto {
  @ApiProperty({
    description: 'Defined areas that currently contain this point',
    type: [String],
  })
  containedAreaIds: string[];

  @ApiProperty({
    description: 'Areas the user entered on this ping (new logs)',
    type: [String],
  })
  enteredAreaIds: string[];
}
