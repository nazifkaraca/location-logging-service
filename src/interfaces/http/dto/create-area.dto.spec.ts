import {
  ArgumentMetadata,
  BadRequestException,
  ValidationPipe,
} from '@nestjs/common';
import { validationPipeOptions } from '../configure-app';
import { CreateAreaDto } from './create-area.dto';
import { boundingBoxPolygon } from '../../../domain/geo/polygon';

const pipe = new ValidationPipe(validationPipeOptions);
const metadata: ArgumentMetadata = {
  type: 'body',
  metatype: CreateAreaDto,
};

function body(name: unknown) {
  return { name, polygon: boundingBoxPolygon(29.0, 41.0, 29.1, 41.1) };
}

describe('CreateAreaDto', () => {
  it('trims name', async () => {
    const parsed = (await pipe.transform(
      body('  Kadıköy  '),
      metadata,
    )) as CreateAreaDto;
    expect(parsed.name).toBe('Kadıköy');
  });

  it('rejects whitespace-only names', async () => {
    await expect(pipe.transform(body('   '), metadata)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
