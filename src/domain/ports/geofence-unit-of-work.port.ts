export interface GeofenceSession {
  findContainingAreaIds(longitude: number, latitude: number): Promise<string[]>;
  listPresence(userId: string): Promise<string[]>;
  recordEnter(userId: string, areaId: string): Promise<void>;
  clearPresence(userId: string, areaIds: string[]): Promise<void>;
}

export interface GeofenceUnitOfWork {
  withUserLock<T>(
    userId: string,
    work: (session: GeofenceSession) => Promise<T>,
  ): Promise<T>;
}
