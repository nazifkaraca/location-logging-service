# Martı Location Logging API

Backend take-home for Martı: record **area entry events**, not a GPS trail.

Users send latitude/longitude pings. The API compares each ping against predefined GeoJSON polygons. A row is written to `area_entry_logs` only when a user **first enters** a defined area. Pings while still inside are a no-op. Raw locations are never stored.

The npm package and local project name is `marti-location-logging-api`. Layout is hexagonal: domain and use cases have no Nest/TypeORM imports; HTTP and PostGIS sit on the outside.

## Run locally

Requires Node 22+ and PostgreSQL 16 with PostGIS (Docker is the default path).

```bash
cp .env.example .env
docker compose up -d
npm install
npm run start:dev
```

- API: http://127.0.0.1:43123
- Swagger: http://127.0.0.1:43123/docs
- Health: http://127.0.0.1:43123/health

On boot, if `SEED_ON_BOOT=true` and `areas` is empty, four Istanbul polygons are inserted: Kadıköy, Moda Slow Zone (overlaps Kadıköy), Beşiktaş, Beyoğlu.

### Try an enter, then a no-op

Kadıköy seed box is roughly `29.01–29.08` lng, `40.975–41.02` lat.

```bash
# first enter → enteredAreaIds is non-empty, one log row
curl -s -X POST http://127.0.0.1:43123/locations \
  -H 'Content-Type: application/json' \
  -d '{"userId":"ali","latitude":40.995,"longitude":29.045}'

# still inside → enteredAreaIds is [], log count stays 1
curl -s -X POST http://127.0.0.1:43123/locations \
  -H 'Content-Type: application/json' \
  -d '{"userId":"ali","latitude":40.996,"longitude":29.046}'

curl -s 'http://127.0.0.1:43123/logs?userId=ali'
```

## API

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/locations` | Ingest a ping. Body: `{ userId, latitude, longitude }` |
| `GET` | `/logs` | List entry logs. Query: `userId`, `areaId`, `from`, `to`, `page`, `limit`. Always `entered_at DESC` |
| `POST` | `/areas` | Create a polygon. Body: `{ name, polygon }` GeoJSON Polygon **coordinates** (`[lng, lat]`, closed ring) |
| `GET` | `/areas` | List defined areas |
| `GET` | `/health` | Database + PostGIS extension |

There is no users table and no auth. `userId` is an opaque string (max 128).

## How enter detection works

Areas are sparse geofences. The map is not partitioned into “defined vs undefined regions.” Anything outside the stored polygons is simply not an area.

Each ping:

1. Validates lat/lng bounds.
2. Asks PostGIS which polygons **cover** the point (`ST_Covers` + GiST). The boundary counts as inside.
3. Takes a transaction-scoped advisory lock on `userId` so concurrent pings cannot double-enter.
4. Diffs that set against `user_area_presence` (who is inside **right now**).
5. New ids → insert log + presence. Missing ids → delete presence only. Same set → no writes.

```
outside  →  Kadıköy          = 1 log
inside   →  50 more pings    = still 1 log
Kadıköy  →  street           = presence cleared, no log, no "entered nowhere"
street   →  Beşiktaş         = 1 new log
overlap  →  Kadıköy ∩ Moda   = two independent enters
```

## Schema

- `areas` — name + `geometry(Polygon, 4326)`, GiST on `polygon`
- `user_area_presence` — `(user_id, area_id)` current set only
- `area_entry_logs` — `user_id`, `area_id`, `entered_at` (server time)

Migrations run on boot (`synchronize` is off). SQL lives in `src/infrastructure/persistence/typeorm/migrations`.

## Layout (hexagonal)

```
src/domain/            # models, polygon rules, ports (interfaces)
src/application/       # use cases; wired to ports via factory providers
src/infrastructure/    # PostGIS/TypeORM adapters + Istanbul seed
src/interfaces/http/   # controllers, DTOs, validation, Swagger
```

A use case never imports `typeorm` or a controller. The enter-only rule lives in `IngestLocationUseCase` and is unit-tested against an in-memory port fake. PostGIS `ST_Covers` and the advisory lock live in `PostgresGeofenceUnitOfWork`.

## Load

The expensive thing in this brief is **writes**. The design therefore does not persist pings. After the first enter, the hot path is: spatial query + presence read + no-op.

- No Redis: presence and polygons already live in Postgres. A cache would be a second source of truth for a few dozen areas.
- No Kafka: `POST /locations` is synchronous and must return `enteredAreaIds`. A queue either delays the log or adds produce+consume on the same request. Per-user ordering is the advisory lock.

```bash
k6 run load/inside-spam.js          # one user, many pings → exactly 1 log
k6 run load/many-users.js           # many users, first enter
```

## Tests

```bash
npm test                            # polygon validation + set-diff
npm run test:e2e                    # enter / re-ping / re-entry / overlap / boundary / invalid / concurrent
```

`test:e2e` uses database `marti_location_test`. Create it once:

```bash
psql -U marti -d postgres -c "CREATE DATABASE marti_location_test;"
psql -U marti -d marti_location_test -c "CREATE EXTENSION IF NOT EXISTS postgis;"
```

With Docker:

```bash
docker compose exec postgres psql -U marti -d postgres -c "CREATE DATABASE marti_location_test;"
docker compose exec postgres psql -U marti -d marti_location_test -c "CREATE EXTENSION IF NOT EXISTS postgis;"
```

## Deliberate gaps

- **No exit log.** Leaving a polygon deletes presence. You can answer “is Ali inside Kadıköy now?” You cannot answer “when did Ali leave?” The natural extension is `exited_at` on the same visit row; the hot path already computes the exit set.
- **No ping stream** while inside. Inside is a state (`user_area_presence`), not an event.
- **No auth, Redis, Kafka, area DELETE, or map UI.** Demo is Swagger plus the Istanbul seed.

## Clone this repository (Windows)

Origin CLI is not available in PowerShell. Use WSL:

```bash
# Run in WSL (Origin CLI is not available in PowerShell)
# Install the Origin CLI
curl -fsSL https://downloads.cursor.com/origin/install.sh | sh

# Sign in (also sets up git credentials)
origin auth login

# Clone into a local folder named for this project
origin repo clone nazif-karaca/marti-challenge marti-location-logging-api
```

If `origin` is not found after install:

```bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

Docs: https://cursor.com/docs/origin/cli
