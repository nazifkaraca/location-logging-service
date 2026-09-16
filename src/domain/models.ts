export type Area = {
  id: string;
  name: string;
  polygon: number[][][];
  createdAt: Date;
};

export type LocationPing = {
  userId: string;
  latitude: number;
  longitude: number;
};

export type LocationIngestResult = {
  containedAreaIds: string[];
  enteredAreaIds: string[];
};

export type AreaEntryLog = {
  id: string;
  userId: string;
  areaId: string;
  enteredAt: Date;
};

export type EntryLogQuery = {
  userId?: string;
  areaId?: string;
  from?: string;
  to?: string;
  page: number;
  limit: number;
};

export type PaginatedEntryLogs = {
  items: AreaEntryLog[];
  page: number;
  limit: number;
  total: number;
};

export type HealthStatus = {
  status: 'ok' | 'degraded';
  database: boolean;
  postgis: boolean;
};
