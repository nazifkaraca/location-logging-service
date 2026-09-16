# Location Logging API

Devices send location pings on an interval. This service checks each ping against stored geofences and writes a log when someone enters one. It does not keep a GPS trail — the question is “when did Ali enter Kadıköy?”, not “where is Ali right now?”.

Stack: NestJS, TypeScript, PostgreSQL + PostGIS, TypeORM.

## What it does

- **Areas.** `POST /areas` adds a GeoJSON polygon (`[lng, lat]`, closed ring). Areas may overlap; each overlap is counted on its own.
- **Pings.** `POST /locations` takes `{ userId, latitude, longitude }`. No users table; `userId` is a string, max 128 chars. Ingest stays unauthenticated so devices can ping.
- **Enter only.** If the point lands inside a polygon the user was not already in (boundary counts), one row is written: `userId`, `areaId`, `entered_at`. Further pings while still inside do nothing. Leaving clears presence; there is no exit log.
- **Logs.** `GET /logs` filters by user, area, time range, and page. Always `entered_at DESC`.
- **Health.** `GET /health` checks Postgres and the PostGIS extension. HTTP 200 only when both are up; otherwise 503 and `{ status: "degraded", ... }`.
- **Admin key.** `POST/GET /areas` and `GET /logs` require `X-API-Key`. `POST /locations` stays open for device pings.

Raw pings are not stored, so spam while inside stays cheap: a spatial query and a presence read, usually no insert. Concurrent first-enters for the same user cannot double-log: presence is unique, and the log row is written only if that insert wins.

Full request/response shapes: http://127.0.0.1:43123/docs

## Run

Docker is required. Do not commit `.env`.

```bash
cp .env.example .env          # Windows: copy .env.example .env
docker compose up --build
```

- API: http://127.0.0.1:43123
- Swagger: http://127.0.0.1:43123/docs
- Health: http://127.0.0.1:43123/health

Postgres in Docker, API on the host:

```bash
cp .env.example .env
docker compose up -d postgres
npm install
npm run start:dev
```

If `SEED_ON_BOOT=true` and `areas` is empty, four Istanbul boxes are inserted: Kadıköy, Moda Slow Zone (inside Kadıköy), Beşiktaş, Beyoğlu.

Kadıköy is roughly `29.01–29.08` lng, `40.975–41.02` lat. First request is an enter, second is a no-op:

```bash
curl -s -X POST http://127.0.0.1:43123/locations \
  -H 'Content-Type: application/json' \
  -d '{"userId":"ali","latitude":40.995,"longitude":29.045}'

curl -s -X POST http://127.0.0.1:43123/locations \
  -H 'Content-Type: application/json' \
  -d '{"userId":"ali","latitude":40.996,"longitude":29.046}'

curl -s 'http://127.0.0.1:43123/logs?userId=ali' \
  -H 'X-API-Key: dev-local-key'
```

`enteredAreaIds` is filled on the first call, empty on the second. Log count stays 1.

## API

| Method | Path | Body / query |
| --- | --- | --- |
| `POST` | `/locations` | `{ userId, latitude, longitude }` → `{ containedAreaIds, enteredAreaIds }` |
| `GET` | `/logs` | `userId`, `areaId`, `from`, `to`, `page`, `limit` |
| `POST` | `/areas` | `{ name, polygon }` — GeoJSON Polygon coordinates |
| `GET` | `/areas` | defined areas |
| `GET` | `/health` | `{ status, database, postgis }` — 503 if degraded |

## Tests / load

```bash
npm test
npm run test:e2e
k6 run load/inside-spam.js    # one user, many pings → 1 log
k6 run load/many-users.js     # many users, first enter
```

E2E needs `marti_location_test` locally (once):

```bash
docker compose exec postgres psql -U marti -d postgres -c "CREATE DATABASE marti_location_test;"
docker compose exec postgres psql -U marti -d marti_location_test -c "CREATE EXTENSION IF NOT EXISTS postgis;"
```
