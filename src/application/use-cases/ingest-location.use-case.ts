import { LocationIngestResult, LocationPing } from '../../domain/models';
import { diffAreaSets, sortedIds } from '../../domain/geo/set-diff';
import { GeofenceUnitOfWork } from '../../domain/ports/geofence-unit-of-work.port';

export class IngestLocationUseCase {
  constructor(private readonly geofence: GeofenceUnitOfWork) {}

  execute(ping: LocationPing): Promise<LocationIngestResult> {
    return this.geofence.withUserLock(ping.userId, async (session) => {
      const containingIds = await session.findContainingAreaIds(
        ping.longitude,
        ping.latitude,
      );
      const previousIds = await session.listPresence(ping.userId);
      const { entered, exited } = diffAreaSets(previousIds, containingIds);

      if (entered.length === 0 && exited.length === 0) {
        return {
          containedAreaIds: sortedIds(containingIds),
          enteredAreaIds: [],
        };
      }

      for (const areaId of entered) {
        await session.recordEnter(ping.userId, areaId);
      }

      if (exited.length > 0) {
        await session.clearPresence(ping.userId, exited);
      }

      return {
        containedAreaIds: sortedIds(containingIds),
        enteredAreaIds: sortedIds(entered),
      };
    });
  }
}
