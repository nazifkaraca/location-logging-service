import {
  GeofenceSession,
  GeofenceUnitOfWork,
} from '../../domain/ports/geofence-unit-of-work.port';
import { IngestLocationUseCase } from './ingest-location.use-case';

class InMemoryGeofence implements GeofenceUnitOfWork {
  containing = new Set<string>();
  presence = new Map<string, Set<string>>();
  logs: Array<{ userId: string; areaId: string }> = [];
  forcePresenceConflict = false;

  runInTransaction<T>(
    work: (session: GeofenceSession) => Promise<T>,
  ): Promise<T> {
    const session: GeofenceSession = {
      findContainingAreaIds: () => Promise.resolve([...this.containing]),
      listPresence: (id) => Promise.resolve([...(this.presence.get(id) ?? [])]),
      recordEnter: (id, areaId) => {
        if (this.forcePresenceConflict) {
          return Promise.resolve(false);
        }
        this.logs.push({ userId: id, areaId });
        const set = this.presence.get(id) ?? new Set<string>();
        set.add(areaId);
        this.presence.set(id, set);
        return Promise.resolve(true);
      },
      clearPresence: (id, areaIds) => {
        const set = this.presence.get(id) ?? new Set<string>();
        for (const areaId of areaIds) {
          set.delete(areaId);
        }
        this.presence.set(id, set);
        return Promise.resolve();
      },
    };
    return work(session);
  }
}

describe('IngestLocationUseCase', () => {
  it('logs enter once and no-ops while still inside', async () => {
    const geofence = new InMemoryGeofence();
    geofence.containing.add('kadikoy');
    const useCase = new IngestLocationUseCase(geofence);

    const first = await useCase.execute({
      userId: 'ali',
      latitude: 40.99,
      longitude: 29.03,
    });
    const second = await useCase.execute({
      userId: 'ali',
      latitude: 40.991,
      longitude: 29.031,
    });

    expect(first.enteredAreaIds).toEqual(['kadikoy']);
    expect(second.enteredAreaIds).toEqual([]);
    expect(geofence.logs).toHaveLength(1);
  });

  it('does not log leaving for an undefined outside region', async () => {
    const geofence = new InMemoryGeofence();
    geofence.containing.add('kadikoy');
    const useCase = new IngestLocationUseCase(geofence);

    await useCase.execute({
      userId: 'ali',
      latitude: 40.99,
      longitude: 29.03,
    });
    geofence.containing.clear();
    const left = await useCase.execute({
      userId: 'ali',
      latitude: 41.1,
      longitude: 28.9,
    });

    expect(left.enteredAreaIds).toEqual([]);
    expect(left.containedAreaIds).toEqual([]);
    expect(geofence.logs).toHaveLength(1);
  });

  it('does not report an enter when presence insert loses the race', async () => {
    const geofence = new InMemoryGeofence();
    geofence.containing.add('kadikoy');
    geofence.forcePresenceConflict = true;
    const useCase = new IngestLocationUseCase(geofence);

    const result = await useCase.execute({
      userId: 'ali',
      latitude: 40.99,
      longitude: 29.03,
    });

    expect(result.enteredAreaIds).toEqual([]);
    expect(geofence.logs).toHaveLength(0);
  });
});
