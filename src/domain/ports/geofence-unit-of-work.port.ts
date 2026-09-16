export interface GeofenceSession {
  findContainingAreaIds(longitude: number, latitude: number): Promise<string[]>;
  listPresence(userId: string): Promise<string[]>;
  /** True when this ping created presence (and therefore a log). */
  recordEnter(userId: string, areaId: string): Promise<boolean>;
  clearPresence(userId: string, areaIds: string[]): Promise<void>;
}

export interface GeofenceUnitOfWork {
  runInTransaction<T>(
    work: (session: GeofenceSession) => Promise<T>,
  ): Promise<T>;
}
