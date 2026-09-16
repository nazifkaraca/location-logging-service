import { ConfigService } from '@nestjs/config';
import { loadAppConfig, MissingEnvError } from './env';

const required = {
  DATABASE_HOST: 'localhost',
  DATABASE_PORT: '5432',
  DATABASE_USER: 'marti',
  DATABASE_PASSWORD: 'secret',
  DATABASE_NAME: 'marti_location',
};

function from(env: Record<string, string>): ConfigService {
  return new ConfigService(env);
}

describe('loadAppConfig', () => {
  it('fails when a required database variable is missing', () => {
    expect(() =>
      loadAppConfig(from({ ...required, DATABASE_PASSWORD: '' })),
    ).toThrow(MissingEnvError);
  });

  it('defaults pool size and keeps demo seed off', () => {
    const app = loadAppConfig(from(required));
    expect(app.database.poolMax).toBe(30);
    expect(app.seedOnBoot).toBe(false);
    expect(app.port).toBe(43123);
    expect(app.apiKey).toBeUndefined();
  });

  it('reads API_KEY when set', () => {
    const app = loadAppConfig(from({ ...required, API_KEY: 'secret-token' }));
    expect(app.apiKey).toBe('secret-token');
  });
});
