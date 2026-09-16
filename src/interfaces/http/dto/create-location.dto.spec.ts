import {
  ArgumentMetadata,
  BadRequestException,
  ValidationPipe,
} from '@nestjs/common';
import { validationPipeOptions } from '../configure-app';
import { CreateLocationDto } from './create-location.dto';

const pipe = new ValidationPipe(validationPipeOptions);
const metadata: ArgumentMetadata = {
  type: 'body',
  metatype: CreateLocationDto,
};

async function parse(value: unknown): Promise<CreateLocationDto> {
  return pipe.transform(value, metadata) as Promise<CreateLocationDto>;
}

describe('CreateLocationDto', () => {
  it('accepts numeric coordinates', async () => {
    await expect(
      parse({ userId: 'ali', latitude: 40.99, longitude: 29.03 }),
    ).resolves.toEqual({
      userId: 'ali',
      latitude: 40.99,
      longitude: 29.03,
    });
  });

  it.each([
    [{ userId: 'ali', latitude: null, longitude: 29.03 }],
    [{ userId: 'ali', latitude: '', longitude: 29.03 }],
    [{ userId: 'ali', latitude: false, longitude: 29.03 }],
    [{ userId: 'ali', latitude: 40.99, longitude: null }],
    [{ userId: null, latitude: 40.99, longitude: 29.03 }],
  ])('rejects coerced or null values %j', async (body) => {
    await expect(parse(body)).rejects.toBeInstanceOf(BadRequestException);
  });
});
