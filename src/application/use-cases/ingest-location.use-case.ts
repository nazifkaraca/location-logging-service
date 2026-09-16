import { LocationIngestResult, LocationPing } from '../../domain/models';
import { diffAreaSets, sortedIds } from '../../domain/geo/set-diff';
import { GeofenceUnitOfWork } from '../../domain/ports/geofence-unit-of-work.port';

export class IngestLocationUseCase {
  constructor(private readonly geofence: GeofenceUnitOfWork) {}

  async execute(ping: LocationPing): Promise<LocationIngestResult> {
    const containingIds = await this.geofence.findContainingAreaIds(
      ping.longitude,
      ping.latitude,
    );

    return this.geofence.runInTransaction(async (session) => {
      await session.lockUser(ping.userId);
      const previousIds = await session.listPresence(ping.userId);
      const { entered, exited } = diffAreaSets(previousIds, containingIds);

      if (entered.length === 0 && exited.length === 0) {
        return {
          containedAreaIds: sortedIds(containingIds),
          enteredAreaIds: [],
        };
      }

      const recorded: string[] = [];
      for (const areaId of entered) {
        if (await session.recordEnter(ping.userId, areaId)) {
          recorded.push(areaId);
        }
      }

      if (exited.length > 0) {
        await session.clearPresence(ping.userId, exited);
      }

      return {
        containedAreaIds: sortedIds(containingIds),
        enteredAreaIds: sortedIds(recorded),
      };
    });
  }
}
