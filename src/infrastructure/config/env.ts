import { ConfigService } from '@nestjs/config';

export class MissingEnvError extends Error {
  constructor(key: string) {
    super(`Missing required environment variable: ${key}`);
    this.name = 'MissingEnvError';
  }
}

export type AppConfig = {
  nodeEnv: string;
  port: number;
  seedOnBoot: boolean;
  database: {
    host: string;
    port: number;
    user: string;
    password: string;
    name: string;
    poolMax: number;
    logging: boolean;
  };
};

function requireString(config: ConfigService, key: string): string {
  const value = config.get<string>(key);
  if (value === undefined || value.trim() === '') {
    throw new MissingEnvError(key);
  }
  return value;
}

function optionalString(
  config: ConfigService,
  key: string,
  fallback: string,
): string {
  const value = config.get<string>(key);
  if (value === undefined || value.trim() === '') {
    return fallback;
  }
  return value;
}

function parsePositiveInt(raw: string, key: string, max: number): number {
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1 || value > max) {
    throw new Error(`Invalid ${key}: ${raw}`);
  }
  return value;
}

export function loadAppConfig(config: ConfigService): AppConfig {
  return {
    nodeEnv: optionalString(config, 'NODE_ENV', 'development'),
    port: parsePositiveInt(optionalString(config, 'PORT', '43123'), 'PORT', 65535),
    seedOnBoot: optionalString(config, 'SEED_ON_BOOT', 'false') === 'true',
    database: {
      host: requireString(config, 'DATABASE_HOST'),
      port: parsePositiveInt(
        requireString(config, 'DATABASE_PORT'),
        'DATABASE_PORT',
        65535,
      ),
      user: requireString(config, 'DATABASE_USER'),
      password: requireString(config, 'DATABASE_PASSWORD'),
      name: requireString(config, 'DATABASE_NAME'),
      poolMax: parsePositiveInt(
        optionalString(config, 'DATABASE_POOL_MAX', '30'),
        'DATABASE_POOL_MAX',
        10_000,
      ),
      logging: optionalString(config, 'DATABASE_LOGGING', 'false') === 'true',
    },
  };
}
