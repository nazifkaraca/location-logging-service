import { EntryLogQuery, PaginatedEntryLogs } from '../../domain/models';
import { EntryLogQueryPort } from '../../domain/ports/entry-log-query.port';

export class ListLogsUseCase {
  constructor(private readonly logs: EntryLogQueryPort) {}

  execute(query: EntryLogQuery): Promise<PaginatedEntryLogs> {
    return this.logs.find(query);
  }
}
