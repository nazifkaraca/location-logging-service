import { EntryLogQuery, PaginatedEntryLogs } from '../models';

export interface EntryLogQueryPort {
  find(query: EntryLogQuery): Promise<PaginatedEntryLogs>;
}
