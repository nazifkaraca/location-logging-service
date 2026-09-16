process.env.DATABASE_NAME = 'marti_location_test';
process.env.SEED_ON_BOOT = 'false';

import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { boundingBoxPolygon } from '../src/domain/geo/polygon';
import { configureApp } from '../src/interfaces/http/configure-app';

describe('Martı Location Logging API (e2e)', () => {
  let app: INestApplication;
  let db: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.listen(0, '127.0.0.1');
    db = app.get(DataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await db.query(
      'TRUNCATE area_entry_logs, user_area_presence, areas RESTART IDENTITY CASCADE',
    );
  });

  async function createSquare(
    name: string,
    west: number,
    south: number,
    east: number,
    north: number,
  ) {
    const response = await request(app.getHttpServer())
      .post('/areas')
      .send({ name, polygon: boundingBoxPolygon(west, south, east, north) })
      .expect(201);
    return response.body as { id: string; name: string };
  }

  async function ping(userId: string, latitude: number, longitude: number) {
    const response = await request(app.getHttpServer())
      .post('/locations')
      .send({ userId, latitude, longitude })
      .expect(200);
    return response.body as {
      containedAreaIds: string[];
      enteredAreaIds: string[];
    };
  }

  async function logCount(userId: string): Promise<number> {
    const response = await request(app.getHttpServer())
      .get('/logs')
      .query({ userId, limit: 100 })
      .expect(200);
    return (response.body as { total: number }).total;
  }

  it('GET /health reports database and PostGIS', async () => {
    const response = await request(app.getHttpServer())
      .get('/health')
      .expect(200);
    expect(response.body).toMatchObject({
      status: 'ok',
      database: true,
      postgis: true,
    });
  });

  it('logs once on enter and not on re-ping while inside', async () => {
    const area = await createSquare('Zone A', 29.0, 41.0, 29.1, 41.1);

    const outside = await ping('ali', 40.5, 28.9);
    expect(outside.enteredAreaIds).toEqual([]);
    expect(outside.containedAreaIds).toEqual([]);
    expect(await logCount('ali')).toBe(0);

    const enter = await ping('ali', 41.05, 29.05);
    expect(enter.enteredAreaIds).toEqual([area.id]);
    expect(enter.containedAreaIds).toEqual([area.id]);
    expect(await logCount('ali')).toBe(1);

    const stay = await ping('ali', 41.06, 29.06);
    expect(stay.enteredAreaIds).toEqual([]);
    expect(stay.containedAreaIds).toEqual([area.id]);
    expect(await logCount('ali')).toBe(1);
  });

  it('logs a second enter after leaving and coming back', async () => {
    await createSquare('Zone A', 29.0, 41.0, 29.1, 41.1);

    await ping('ali', 41.05, 29.05);
    await ping('ali', 40.5, 28.9);
    await ping('ali', 41.05, 29.05);

    expect(await logCount('ali')).toBe(2);
  });

  it('treats overlapping polygons as independent enters', async () => {
    const kadikoy = await createSquare('Kadıköy', 29.01, 40.975, 29.08, 41.02);
    const moda = await createSquare('Moda', 29.022, 40.978, 29.04, 40.99);

    const result = await ping('ali', 40.984, 29.03);
    expect(result.enteredAreaIds.sort()).toEqual([kadikoy.id, moda.id].sort());
    expect(await logCount('ali')).toBe(2);
  });

  it('counts a boundary point as inside (ST_Covers)', async () => {
    const area = await createSquare('Edge', 29.0, 41.0, 29.1, 41.1);
    const result = await ping('ali', 41.05, 29.0);
    expect(result.enteredAreaIds).toEqual([area.id]);
  });

  it('rejects an invalid polygon', async () => {
    await request(app.getHttpServer())
      .post('/areas')
      .send({
        name: 'bowtie',
        polygon: [
          [
            [29.0, 41.0],
            [29.1, 41.1],
            [29.0, 41.1],
            [29.1, 41.0],
            [29.0, 41.0],
          ],
        ],
      })
      .expect(400);

    await request(app.getHttpServer())
      .post('/areas')
      .send({
        name: 'open',
        polygon: [
          [
            [29.0, 41.0],
            [29.1, 41.0],
            [29.1, 41.1],
            [29.0, 41.1],
          ],
        ],
      })
      .expect(400);
  });

  it('serializes concurrent pings for the same user into a single enter', async () => {
    const area = await createSquare('Zone A', 29.0, 41.0, 29.1, 41.1);

    const responses = await Promise.all(
      Array.from({ length: 20 }, () =>
        request(app.getHttpServer())
          .post('/locations')
          .send({ userId: 'race', latitude: 41.05, longitude: 29.05 }),
      ),
    );

    expect(responses.every((res) => res.status === 200)).toBe(true);
    const entered = responses.filter(
      (res) =>
        (res.body as { enteredAreaIds: string[] }).enteredAreaIds.length > 0,
    );
    expect(entered).toHaveLength(1);
    expect(entered[0].body.enteredAreaIds).toEqual([area.id]);
    expect(await logCount('race')).toBe(1);
  });

  it('keeps the parent enter when leaving a nested area', async () => {
    const kadikoy = await createSquare('Kadıköy', 29.01, 40.975, 29.08, 41.02);
    const moda = await createSquare('Moda', 29.022, 40.978, 29.04, 40.99);

    const both = await ping('ali', 40.984, 29.03);
    expect(both.enteredAreaIds.sort()).toEqual([kadikoy.id, moda.id].sort());

    const parentOnly = await ping('ali', 41.0, 29.05);
    expect(parentOnly.containedAreaIds).toEqual([kadikoy.id]);
    expect(parentOnly.enteredAreaIds).toEqual([]);
    expect(await logCount('ali')).toBe(2);
  });
});
